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
import type { ProjectConfiguration, configuredEstimate } from "../project-options";

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

export const paymentStatus = pgEnum("payment_status", ["pending", "paid", "failed"]);
export const hostingStatus = pgEnum("hosting_status", ["uploading", "building", "ready", "failed"]);
export const reviewStatus = pgEnum("review_status", ["pending", "approved", "rejected"]);

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
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  accessVersion: integer("access_version").notNull().default(0),
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

/**
 * One authoritative payment record per project and PayPal environment.
 * Sandbox transactions must never satisfy a live payment. Provider secrets
 * and raw PayPal payloads are deliberately never persisted here.
 */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    provider: text("provider").notNull().default("paypal"),
    environment: text("environment").notNull().default("sandbox"),
    billingStage: text("billing_stage").notNull().default("legacy"),
    providerOrderId: text("provider_order_id").unique(),
    providerCaptureId: text("provider_capture_id").unique(),
    status: paymentStatus("status").notNull().default("pending"),
    /** Integer minor units avoid floating-point rounding in payment checks. */
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("EUR"),
    attempt: integer("attempt").notNull().default(1),
    failureCode: text("failure_code"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("payments_project_environment_stage_unique").on(t.projectId, t.environment, t.billingStage),
    index("payments_project_idx").on(t.projectId),
    index("payments_user_idx").on(t.userId),
    index("payments_status_idx").on(t.status),
  ],
);

export const hostedSites = pgTable(
  "hosted_sites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    projectName: text("project_name").notNull().unique(),
    framework: text("framework").notNull(),
    deploymentId: text("deployment_id").unique(),
    url: text("url"),
    status: hostingStatus("status").notNull().default("uploading"),
    errorMessage: text("error_message"),
    fileCount: integer("file_count").notNull().default(0),
    totalBytes: integer("total_bytes").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("hosted_sites_user_idx").on(t.userId, t.createdAt), index("hosted_sites_status_idx").on(t.status)],
);

/** Public customer opinions. New submissions stay private until staff approval. */
export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    company: text("company"),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    status: reviewStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
  },
  (t) => [index("reviews_status_created_idx").on(t.status, t.createdAt), index("reviews_user_idx").on(t.userId, t.createdAt)],
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
export const projectRequests = pgTable("project_requests", {
  projectId: uuid("project_id").primaryKey().references(() => projects.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  configuration: jsonb("configuration").$type<ProjectConfiguration>().notNull(),
  estimate: jsonb("estimate").$type<ReturnType<typeof configuredEstimate>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectBilling = pgTable("project_billing", {
  projectId: uuid("project_id").primaryKey().references(() => projects.id, { onDelete: "cascade" }),
  approvedTotalCents: integer("approved_total_cents"),
  approvedBy: uuid("approved_by").references(() => users.id, { onDelete: "restrict" }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformOwner = pgTable("platform_owner", {
  slot: integer("slot").primaryKey().default(1),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "restrict" }),
});
export const staffAccess = pgTable("staff_access", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  updatedBy: uuid("updated_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const staffInvitations = pgTable("staff_invitations", {
  id: uuid("id").defaultRandom().primaryKey(), email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  permissions: jsonb("permissions").$type<string[]>().notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("staff_invitations_email_idx").on(table.email)]);
export const adminAudit = pgTable("admin_audit", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  targetId: uuid("target_id"), action: text("action").notNull(),
  details: jsonb("details").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("admin_audit_created_idx").on(table.createdAt)]);
export const subscriptionOrders = pgTable("subscription_orders", {
  projectId: uuid("project_id").primaryKey().references(() => projects.id, { onDelete: "cascade" }),
  version: integer("version").notNull().default(2), planId: text("plan_id").notNull(),
  snapshot: jsonb("snapshot").$type<{ reports: number; sites: number; compare: boolean; jsonExport: boolean; price: number; durationDays: number }>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const siteAudits = pgTable("site_audits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  source: text("source").notNull(), target: text("target").notNull(),
  status: text("status").notNull().default("pending"),
  report: jsonb("report").$type<import("../audits/types").AuditReport>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("site_audits_user_created_idx").on(table.userId, table.createdAt)]);
export const projectAgreements = pgTable("project_agreements", {
  projectId: uuid("project_id").primaryKey().references(() => projects.id, { onDelete: "cascade" }),
  agreement: jsonb("agreement").$type<import("../project-agreement").ProjectAgreement>().notNull(),
  updatedBy: uuid("updated_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const projectDecisions = pgTable("project_decisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  requestedBy: uuid("requested_by").notNull().references(() => users.id, { onDelete: "restrict" }),
  title: text("title").notNull(), detail: text("detail").notNull(),
  priceCents: integer("price_cents"), extraDays: integer("extra_days"),
  state: text("state").notNull().default("pending"), response: text("response"),
  answeredBy: uuid("answered_by").references(() => users.id, { onDelete: "restrict" }),
  answeredAt: timestamp("answered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("project_decisions_project_idx").on(table.projectId)]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Milestone = typeof projectMilestones.$inferSelect;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type FeedbackRow = typeof feedback.$inferSelect;
export type MessageRow = typeof messages.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type HostedSite = typeof hostedSites.$inferSelect;
export type Review = typeof reviews.$inferSelect;
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
export type PaymentStatus = (typeof paymentStatus.enumValues)[number];
export type HostingStatus = (typeof hostingStatus.enumValues)[number];
export type ReviewStatus = (typeof reviewStatus.enumValues)[number];
