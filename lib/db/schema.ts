/**
 * AWWA platform — Neon Postgres schema (Drizzle ORM).
 *
 * Replaces the previous Supabase schema. Because Neon has no built-in auth
 * layer and no `auth.uid()`, row-level authorisation lives in `lib/db/access.ts`
 * and is enforced by the server actions in `app/actions/*`.
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/* ------------------------------------------------------------------ *
 * Enums
 * ------------------------------------------------------------------ */
export const appRole = pgEnum("app_role", [
  "super_admin",
  "admin",
  "pm",
  "employee",
  "client",
]);

export const projectStage = pgEnum("project_stage", [
  "planning",
  "design",
  "development",
  "testing",
  "review",
  "completed",
]);

export const milestoneStatus = pgEnum("milestone_status", [
  "todo",
  "in_progress",
  "blocked",
  "done",
]);

export const fileCategory = pgEnum("file_category", [
  "design",
  "document",
  "contract",
  "source",
  "invoice",
  "media",
]);

export const feedbackCategory = pgEnum("feedback_category", [
  "design",
  "content",
  "bug",
  "scope",
]);

export const projectVisibility = pgEnum("project_visibility", ["public", "private"]);

export const leadStatus = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
]);

export const mediaKind = pgEnum("media_kind", ["image", "video", "demo", "document"]);

/* ------------------------------------------------------------------ *
 * Auth.js core tables (Drizzle adapter contract)
 * ------------------------------------------------------------------ */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
  image: text("image"),
  /** bcrypt hash — null for OAuth-only accounts. */
  passwordHash: text("password_hash"),
  role: appRole("role").notNull().default("client"),
  company: text("company"),
  title: text("title"),
  phone: text("phone"),
  locale: text("locale").notNull().default("ar"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* ------------------------------------------------------------------ *
 * Domain tables
 * ------------------------------------------------------------------ */
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    summary: text("summary").notNull().default(""),
    clientId: uuid("client_id").references(() => users.id, { onDelete: "set null" }),
    pmId: uuid("pm_id").references(() => users.id, { onDelete: "set null" }),
    stage: projectStage("stage").notNull().default("planning"),
    /** 0-100, kept in sync with milestones by `recalcProgress`. */
    progress: integer("progress").notNull().default(0),
    visibility: projectVisibility("visibility").notNull().default("private"),
    industry: text("industry").notNull().default("general"),
    budget: integer("budget").notNull().default(0),
    currency: text("currency").notNull().default("EUR"),
    startDate: timestamp("start_date", { withTimezone: true }),
    deadline: timestamp("deadline", { withTimezone: true }),
    /** Estimated remaining effort in hours, shown to the client. */
    estimatedHours: integer("estimated_hours").notNull().default(0),
    hoursLogged: integer("hours_logged").notNull().default(0),
    tech: jsonb("tech").$type<string[]>().notNull().default([]),
    cover: text("cover"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("projects_client_idx").on(t.clientId),
    index("projects_visibility_idx").on(t.visibility),
  ],
);

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: appRole("role").notNull().default("employee"),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.userId] })],
);

export const projectMilestones = pgTable(
  "project_milestones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    stage: projectStage("stage").notNull().default("planning"),
    status: milestoneStatus("status").notNull().default("todo"),
    assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "set null" }),
    dueDate: timestamp("due_date", { withTimezone: true }),
    estimatedHours: integer("estimated_hours").notNull().default(0),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("milestones_project_idx").on(t.projectId, t.orderIndex)],
);

export const projectFiles = pgTable(
  "project_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: fileCategory("category").notNull().default("document"),
    /** `image` / `video` / `demo` render inline in the client dashboard. */
    kind: mediaKind("kind").notNull().default("document"),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    sizeKb: integer("size_kb").notNull().default(0),
    version: text("version").notNull().default("v1"),
    /** Hidden drafts stay invisible to the client until published. */
    visibleToClient: boolean("visible_to_client").notNull().default(true),
    uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("files_project_idx").on(t.projectId)],
);

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    category: feedbackCategory("category").notNull().default("design"),
    body: text("body").notNull(),
    resolved: boolean("resolved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("feedback_project_idx").on(t.projectId)],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").references(() => users.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_project_idx").on(t.projectId, t.createdAt)],
);

/** Public quote form — no account required. */
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    phone: text("phone"),
    locale: text("locale").notNull().default("ar"),
    projectType: text("project_type").notNull().default("website"),
    services: jsonb("services").$type<string[]>().notNull().default([]),
    budgetEstimate: integer("budget_estimate").notNull().default(0),
    timelineWeeks: integer("timeline_weeks").notNull().default(0),
    currency: text("currency").notNull().default("EUR"),
    message: text("message"),
    status: leadStatus("status").notNull().default("new"),
    /** Set once a lead is converted into a real client account. */
    convertedUserId: uuid("converted_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("leads_status_idx").on(t.status),
    uniqueIndex("leads_email_created_idx").on(t.email, t.createdAt),
  ],
);

/* ------------------------------------------------------------------ *
 * Inferred types — the app imports these instead of hand-written ones.
 * ------------------------------------------------------------------ */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Milestone = typeof projectMilestones.$inferSelect;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type FeedbackRow = typeof feedback.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type AppRole = (typeof appRole.enumValues)[number];
export type ProjectStage = (typeof projectStage.enumValues)[number];
export type MilestoneStatus = (typeof milestoneStatus.enumValues)[number];
export type FileCategory = (typeof fileCategory.enumValues)[number];
export type FeedbackCategory = (typeof feedbackCategory.enumValues)[number];
export type Visibility = (typeof projectVisibility.enumValues)[number];
export type MediaKind = (typeof mediaKind.enumValues)[number];
export type LeadStatus = (typeof leadStatus.enumValues)[number];
