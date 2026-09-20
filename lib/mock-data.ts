import type {
  AppRole,
  Feedback,
  Message,
  Profile,
  Project,
  ProjectFile,
  ProjectMilestone,
  UserRole,
} from "./demo-types";

export const profiles: Profile[] = [
  { id: "u-001", full_name: "Omar Al-Kaabi", email: "omar@aakwhx.com", avatar_url: null, company: "AAKWHX", title: "Founder / Super Admin", locale: "ar", created_at: "2016-04-02" },
  { id: "u-002", full_name: "Lieke van Dijk", email: "lieke@aakwhx.com", avatar_url: null, company: "AAKWHX", title: "Head of Delivery", locale: "nl", created_at: "2018-09-11" },
  { id: "u-003", full_name: "Jonas Weber", email: "jonas@aakwhx.com", avatar_url: null, company: "AAKWHX", title: "Project Manager", locale: "de", created_at: "2020-01-20" },
  { id: "u-004", full_name: "Elif Demir", email: "elif@aakwhx.com", avatar_url: null, company: "AAKWHX", title: "Lead Engineer", locale: "tr", created_at: "2021-03-15" },
  { id: "u-005", full_name: "Camille Rousseau", email: "camille@aakwhx.com", avatar_url: null, company: "AAKWHX", title: "Product Designer", locale: "fr", created_at: "2022-06-01" },
  { id: "u-006", full_name: "Diego Márquez", email: "diego@aakwhx.com", avatar_url: null, company: "AAKWHX", title: "DevOps Engineer", locale: "es", created_at: "2023-02-14" },
  { id: "u-101", full_name: "Nadia Haddad", email: "nadia@meridian-health.com", avatar_url: null, company: "Meridian Health", title: "CTO", locale: "en", created_at: "2024-05-06" },
  { id: "u-102", full_name: "Tom Bakker", email: "tom@northgate-logistics.nl", avatar_url: null, company: "Northgate Logistics", title: "COO", locale: "nl", created_at: "2024-08-19" },
  { id: "u-103", full_name: "Sara Yilmaz", email: "sara@atlasretail.com", avatar_url: null, company: "Atlas Retail Group", title: "Head of Digital", locale: "tr", created_at: "2025-01-08" },
];

export const userRoles: UserRole[] = [
  { id: "r-1", user_id: "u-001", role: "super_admin", created_at: "2016-04-02" },
  { id: "r-2", user_id: "u-002", role: "admin", created_at: "2018-09-11" },
  { id: "r-3", user_id: "u-003", role: "pm", created_at: "2020-01-20" },
  { id: "r-4", user_id: "u-004", role: "employee", created_at: "2021-03-15" },
  { id: "r-5", user_id: "u-005", role: "employee", created_at: "2022-06-01" },
  { id: "r-6", user_id: "u-006", role: "employee", created_at: "2023-02-14" },
  { id: "r-7", user_id: "u-101", role: "client", created_at: "2024-05-06" },
  { id: "r-8", user_id: "u-102", role: "client", created_at: "2024-08-19" },
  { id: "r-9", user_id: "u-103", role: "client", created_at: "2025-01-08" },
];

export const projects: Project[] = [
  {
    id: "p-001", slug: "meridian-care-cloud", name: "Meridian Care Cloud",
    summary: "A HIPAA-aligned patient coordination platform unifying 14 clinics, with realtime triage queues and an AI intake assistant.",
    client_id: "u-101", pm_id: "u-003", stage: "development", progress: 62, visibility: "public",
    industry: "Healthcare", budget: 285000, currency: "EUR", start_date: "2025-03-03", deadline: "2026-01-30",
    tech: ["Next.js", "Neon", "OpenAI", "Terraform"], cover: "from-emerald-500/30 via-teal-500/20 to-cyan-500/30", created_at: "2025-02-18",
  },
  {
    id: "p-002", slug: "northgate-fleet-erp", name: "Northgate Fleet ERP",
    summary: "Custom ERP replacing five legacy tools: fleet telemetry, driver scheduling, fuel analytics and automated invoicing.",
    client_id: "u-102", pm_id: "u-002", stage: "testing", progress: 84, visibility: "public",
    industry: "Logistics", budget: 410000, currency: "EUR", start_date: "2024-11-04", deadline: "2025-11-14",
    tech: ["Next.js", "PostgreSQL", "Kafka", "Kubernetes"], cover: "from-blue-500/30 via-indigo-500/20 to-violet-500/30", created_at: "2024-10-10",
  },
  {
    id: "p-003", slug: "atlas-commerce-relaunch", name: "Atlas Commerce Relaunch",
    summary: "Headless commerce rebuild across 7 markets and 7 languages, cutting time-to-first-byte from 1.4s to 180ms.",
    client_id: "u-103", pm_id: "u-003", stage: "design", progress: 31, visibility: "public",
    industry: "Retail", budget: 196000, currency: "EUR", start_date: "2025-07-01", deadline: "2026-03-20",
    tech: ["Next.js", "Shopify", "Algolia", "Vercel"], cover: "from-amber-500/30 via-orange-500/20 to-rose-500/30", created_at: "2025-06-12",
  },
  {
    id: "p-004", slug: "confidential-fintech-core", name: "Confidential — Tier-1 Fintech Core",
    summary: "Ledger modernisation and real-time fraud scoring for a European banking group. Details available under NDA.",
    client_id: "u-101", pm_id: "u-002", stage: "review", progress: 93, visibility: "private",
    industry: "Finance", budget: 890000, currency: "EUR", start_date: "2024-02-01", deadline: "2025-10-01",
    tech: ["Rust", "PostgreSQL", "gRPC", "AWS"], cover: "from-slate-500/30 via-zinc-500/20 to-slate-700/30", created_at: "2024-01-08",
  },
  {
    id: "p-005", slug: "kinetic-energy-portal", name: "Kinetic Energy Portal",
    summary: "Consumer-facing energy dashboard with smart-meter ingestion, tariff simulation and carbon reporting.",
    client_id: "u-102", pm_id: "u-003", stage: "planning", progress: 12, visibility: "public",
    industry: "Energy", budget: 154000, currency: "EUR", start_date: "2025-09-01", deadline: "2026-05-15",
    tech: ["Next.js", "TimescaleDB", "MQTT"], cover: "from-lime-500/30 via-green-500/20 to-emerald-500/30", created_at: "2025-08-20",
  },
  {
    id: "p-006", slug: "confidential-gov-identity", name: "Confidential — National Identity Wallet",
    summary: "Sovereign digital identity wallet with eIDAS-2 alignment and offline verifiable credentials.",
    client_id: "u-103", pm_id: "u-002", stage: "completed", progress: 100, visibility: "private",
    industry: "Government", budget: 1250000, currency: "EUR", start_date: "2023-01-09", deadline: "2024-12-20",
    tech: ["Kotlin", "Swift", "Rust", "HSM"], cover: "from-cyan-500/30 via-sky-500/20 to-blue-700/30", created_at: "2022-12-01",
  },
  {
    id: "p-007", slug: "aurora-studio-brand", name: "Aurora Studio Brand System",
    summary: "Full brand and motion system with an accessible component library shipped in seven languages.",
    client_id: "u-103", pm_id: "u-003", stage: "completed", progress: 100, visibility: "public",
    industry: "Media", budget: 78000, currency: "EUR", start_date: "2025-01-15", deadline: "2025-06-30",
    tech: ["Figma", "Storybook", "Tailwind"], cover: "from-fuchsia-500/30 via-purple-500/20 to-indigo-500/30", created_at: "2024-12-20",
  },
  {
    id: "p-008", slug: "vertex-ai-desk", name: "Vertex AI Support Desk",
    summary: "RAG support agent resolving 68% of tier-1 tickets across email, chat and voice in six languages.",
    client_id: "u-101", pm_id: "u-002", stage: "development", progress: 47, visibility: "public",
    industry: "SaaS", budget: 132000, currency: "EUR", start_date: "2025-05-20", deadline: "2025-12-19",
    tech: ["Next.js", "pgvector", "LangGraph"], cover: "from-rose-500/30 via-pink-500/20 to-fuchsia-500/30", created_at: "2025-04-30",
  },
];

export const milestones: ProjectMilestone[] = [
  { id: "m-1", project_id: "p-001", title: "Discovery workshops & clinical process mapping", stage: "planning", status: "done", assignee_id: "u-003", due_date: "2025-03-28", order_index: 1 },
  { id: "m-2", project_id: "p-001", title: "Design system & triage board prototypes", stage: "design", status: "done", assignee_id: "u-005", due_date: "2025-05-16", order_index: 2 },
  { id: "m-3", project_id: "p-001", title: "Patient records module & FHIR sync", stage: "development", status: "in_progress", assignee_id: "u-004", due_date: "2025-10-10", order_index: 3 },
  { id: "m-4", project_id: "p-001", title: "AI intake assistant integration", stage: "development", status: "in_progress", assignee_id: "u-004", due_date: "2025-11-07", order_index: 4 },
  { id: "m-5", project_id: "p-001", title: "Penetration test & load certification", stage: "testing", status: "todo", assignee_id: "u-006", due_date: "2025-12-12", order_index: 5 },
  { id: "m-6", project_id: "p-001", title: "Clinical sign-off & staff training", stage: "review", status: "todo", assignee_id: "u-003", due_date: "2026-01-23", order_index: 6 },

  { id: "m-7", project_id: "p-002", title: "Legacy data migration plan", stage: "planning", status: "done", assignee_id: "u-002", due_date: "2024-12-06", order_index: 1 },
  { id: "m-8", project_id: "p-002", title: "Dispatch console UX", stage: "design", status: "done", assignee_id: "u-005", due_date: "2025-02-14", order_index: 2 },
  { id: "m-9", project_id: "p-002", title: "Telemetry ingestion pipeline", stage: "development", status: "done", assignee_id: "u-004", due_date: "2025-06-27", order_index: 3 },
  { id: "m-10", project_id: "p-002", title: "Invoice automation & VAT rules", stage: "development", status: "done", assignee_id: "u-004", due_date: "2025-08-29", order_index: 4 },
  { id: "m-11", project_id: "p-002", title: "UAT with 40 dispatchers", stage: "testing", status: "in_progress", assignee_id: "u-003", due_date: "2025-10-17", order_index: 5 },
  { id: "m-12", project_id: "p-002", title: "Go-live readiness review", stage: "review", status: "todo", assignee_id: "u-002", due_date: "2025-11-07", order_index: 6 },

  { id: "m-13", project_id: "p-003", title: "Market & catalogue audit", stage: "planning", status: "done", assignee_id: "u-003", due_date: "2025-07-25", order_index: 1 },
  { id: "m-14", project_id: "p-003", title: "Storefront art direction (7 locales)", stage: "design", status: "in_progress", assignee_id: "u-005", due_date: "2025-09-26", order_index: 2 },
  { id: "m-15", project_id: "p-003", title: "Checkout & payments build", stage: "development", status: "todo", assignee_id: "u-004", due_date: "2025-12-19", order_index: 3 },
  { id: "m-16", project_id: "p-003", title: "Performance & SEO certification", stage: "testing", status: "todo", assignee_id: "u-006", due_date: "2026-02-13", order_index: 4 },
  { id: "m-17", project_id: "p-003", title: "Launch sign-off", stage: "review", status: "todo", assignee_id: "u-003", due_date: "2026-03-13", order_index: 5 },

  { id: "m-18", project_id: "p-008", title: "Knowledge base ingestion", stage: "planning", status: "done", assignee_id: "u-002", due_date: "2025-06-06", order_index: 1 },
  { id: "m-19", project_id: "p-008", title: "Agent conversation design", stage: "design", status: "done", assignee_id: "u-005", due_date: "2025-07-11", order_index: 2 },
  { id: "m-20", project_id: "p-008", title: "Retrieval pipeline & evals", stage: "development", status: "in_progress", assignee_id: "u-004", due_date: "2025-10-24", order_index: 3 },
  { id: "m-21", project_id: "p-008", title: "Voice channel rollout", stage: "development", status: "blocked", assignee_id: "u-006", due_date: "2025-11-21", order_index: 4 },
  { id: "m-22", project_id: "p-008", title: "Accuracy acceptance testing", stage: "testing", status: "todo", assignee_id: "u-003", due_date: "2025-12-05", order_index: 5 },
];

export const files: ProjectFile[] = [
  { id: "f-1", project_id: "p-001", name: "Meridian_DesignSystem_v4.fig", category: "design", size_kb: 48211, version: "v4.2", uploaded_by: "u-005", created_at: "2025-08-28", storage_path: "p-001/design/meridian-ds-v4.fig" },
  { id: "f-2", project_id: "p-001", name: "Triage_Flow_Specification.pdf", category: "document", size_kb: 2140, version: "v1.8", uploaded_by: "u-003", created_at: "2025-08-14", storage_path: "p-001/docs/triage-spec.pdf" },
  { id: "f-3", project_id: "p-001", name: "MSA_and_DPA_Signed.pdf", category: "contract", size_kb: 890, version: "final", uploaded_by: "u-002", created_at: "2025-02-27", storage_path: "p-001/legal/msa-dpa.pdf" },
  { id: "f-4", project_id: "p-001", name: "Sprint_14_Release_Notes.md", category: "document", size_kb: 46, version: "v14", uploaded_by: "u-004", created_at: "2025-09-01", storage_path: "p-001/docs/sprint-14.md" },
  { id: "f-5", project_id: "p-001", name: "Invoice_2025_Q3.pdf", category: "invoice", size_kb: 214, version: "Q3", uploaded_by: "u-002", created_at: "2025-07-02", storage_path: "p-001/finance/invoice-q3.pdf" },
  { id: "f-6", project_id: "p-001", name: "patient-portal-ui-kit.zip", category: "source", size_kb: 15320, version: "v2.0", uploaded_by: "u-005", created_at: "2025-06-19", storage_path: "p-001/source/ui-kit.zip" },
  { id: "f-7", project_id: "p-002", name: "Fleet_ERP_UAT_Report.pdf", category: "document", size_kb: 3320, version: "v2.1", uploaded_by: "u-003", created_at: "2025-08-30", storage_path: "p-002/docs/uat.pdf" },
  { id: "f-8", project_id: "p-002", name: "Dispatch_Console_Handoff.fig", category: "design", size_kb: 29840, version: "v3.0", uploaded_by: "u-005", created_at: "2025-03-05", storage_path: "p-002/design/dispatch.fig" },
  { id: "f-9", project_id: "p-003", name: "Atlas_Localization_Matrix.xlsx", category: "document", size_kb: 512, version: "v1.2", uploaded_by: "u-003", created_at: "2025-08-08", storage_path: "p-003/docs/localization.xlsx" },
  { id: "f-10", project_id: "p-008", name: "RAG_Evaluation_Results.pdf", category: "document", size_kb: 1180, version: "v0.9", uploaded_by: "u-004", created_at: "2025-08-25", storage_path: "p-008/docs/rag-eval.pdf" },
];

export const feedbackItems: Feedback[] = [
  { id: "fb-1", project_id: "p-001", author_id: "u-101", category: "design", body: "The triage queue colour coding is hard to read for our night-shift staff. Can we increase contrast on the amber state?", resolved: true, created_at: "2025-08-21T09:12:00Z" },
  { id: "fb-2", project_id: "p-001", author_id: "u-003", category: "design", body: "Updated the amber token to meet WCAG AA (4.7:1) and shipped it in sprint 13. Ready for your review in staging.", resolved: true, created_at: "2025-08-22T14:03:00Z" },
  { id: "fb-3", project_id: "p-001", author_id: "u-101", category: "scope", body: "Legal asked us to add explicit consent capture before the AI intake assistant starts. Can we scope that in?", resolved: false, created_at: "2025-08-29T08:40:00Z" },
  { id: "fb-4", project_id: "p-001", author_id: "u-004", category: "bug", body: "FHIR sync intermittently retried twice on slow connections — fixed with an idempotency key. Deployed to staging.", resolved: true, created_at: "2025-09-01T11:25:00Z" },
  { id: "fb-5", project_id: "p-001", author_id: "u-101", category: "content", body: "Please replace the placeholder clinic descriptions with the copy in the shared doc, Dutch and Arabic included.", resolved: false, created_at: "2025-09-03T16:47:00Z" },
  { id: "fb-6", project_id: "p-002", author_id: "u-102", category: "bug", body: "Fuel analytics chart shows last month's totals when switching depots quickly.", resolved: false, created_at: "2025-09-02T10:11:00Z" },
];

export const messages: Message[] = [
  { id: "ms-1", project_id: "p-001", sender_id: "u-003", body: "Morning Nadia — sprint 14 demo is scheduled for Thursday 14:00 CET. Agenda is in the portal.", created_at: "2025-09-01T07:30:00Z" },
  { id: "ms-2", project_id: "p-001", sender_id: "u-101", body: "Perfect. I'll bring our head of nursing so she can review the triage board directly.", created_at: "2025-09-01T08:02:00Z" },
  { id: "ms-3", project_id: "p-001", sender_id: "u-003", body: "Great. We'll also walk through the consent-capture estimate you requested — roughly 3 dev days.", created_at: "2025-09-01T08:15:00Z" },
  { id: "ms-4", project_id: "p-001", sender_id: "u-101", body: "Understood, please prepare a change order and we'll approve it this week.", created_at: "2025-09-02T09:44:00Z" },
];

export interface Task {
  id: string;
  project_id: string;
  title: string;
  assignee_id: string;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "critical";
  due_date: string;
  hours: number;
}

export const tasks: Task[] = [
  { id: "t-1", project_id: "p-001", title: "Implement consent-capture modal", assignee_id: "u-004", status: "todo", priority: "high", due_date: "2025-09-19", hours: 24 },
  { id: "t-2", project_id: "p-001", title: "FHIR retry idempotency hardening", assignee_id: "u-004", status: "done", priority: "critical", due_date: "2025-09-01", hours: 12 },
  { id: "t-3", project_id: "p-001", title: "Arabic RTL audit of triage board", assignee_id: "u-005", status: "in_progress", priority: "medium", due_date: "2025-09-15", hours: 16 },
  { id: "t-4", project_id: "p-002", title: "Depot switch cache invalidation bug", assignee_id: "u-006", status: "in_progress", priority: "high", due_date: "2025-09-10", hours: 8 },
  { id: "t-5", project_id: "p-002", title: "UAT feedback triage round 3", assignee_id: "u-003", status: "todo", priority: "medium", due_date: "2025-09-22", hours: 20 },
  { id: "t-6", project_id: "p-003", title: "Localise product taxonomy (7 locales)", assignee_id: "u-005", status: "in_progress", priority: "high", due_date: "2025-09-26", hours: 40 },
  { id: "t-7", project_id: "p-003", title: "Algolia index schema design", assignee_id: "u-004", status: "todo", priority: "medium", due_date: "2025-10-03", hours: 18 },
  { id: "t-8", project_id: "p-008", title: "Voice channel vendor blocked on API keys", assignee_id: "u-006", status: "blocked", priority: "critical", due_date: "2025-09-12", hours: 10 },
  { id: "t-9", project_id: "p-008", title: "Eval harness for retrieval precision", assignee_id: "u-004", status: "in_progress", priority: "high", due_date: "2025-09-18", hours: 26 },
  { id: "t-10", project_id: "p-005", title: "Smart-meter protocol spike (MQTT)", assignee_id: "u-006", status: "todo", priority: "low", due_date: "2025-10-08", hours: 14 },
];

export const kpis = {
  revenueYtd: 3_395_000,
  activeProjects: projects.filter((p) => p.stage !== "completed").length,
  utilisation: 87,
  overdueTasks: 2,
  revenueByMonth: [
    { month: "Jan", value: 218 }, { month: "Feb", value: 264 }, { month: "Mar", value: 301 },
    { month: "Apr", value: 289 }, { month: "May", value: 342 }, { month: "Jun", value: 388 },
    { month: "Jul", value: 401 }, { month: "Aug", value: 436 }, { month: "Sep", value: 466 },
  ],
};

export const testimonials = [
  { quote: "AAKWHX replaced a two-year roadmap with a nine-month delivery — and the system has not blinked since launch.", author: "Nadia Haddad", role: "CTO, Meridian Health" },
  { quote: "The client portal alone changed how we work. We always know exactly where the project stands.", author: "Tom Bakker", role: "COO, Northgate Logistics" },
  { quote: "Seven markets, seven languages, one launch day. That is not normal in retail.", author: "Sara Yilmaz", role: "Head of Digital, Atlas Retail Group" },
];

export function getProfile(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id);
}

export function getRole(userId: string): AppRole {
  return userRoles.find((r) => r.user_id === userId)?.role ?? "client";
}

export function getProject(idOrSlug: string): Project | undefined {
  return projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export function projectMilestones(projectId: string): ProjectMilestone[] {
  return milestones.filter((m) => m.project_id === projectId).sort((a, b) => a.order_index - b.order_index);
}

export function projectFiles(projectId: string): ProjectFile[] {
  return files.filter((f) => f.project_id === projectId);
}

export function projectFeedback(projectId: string): Feedback[] {
  return feedbackItems
    .filter((f) => f.project_id === projectId)
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
}

export function projectMessages(projectId: string): Message[] {
  return messages.filter((m) => m.project_id === projectId);
}

export const industries = Array.from(new Set(projects.map((p) => p.industry)));

/* ------------------------------------------------------------------ *
 * Neon fallbacks
 *
 * When DATABASE_URL is absent the query layer serves these instead, so the
 * preview and the marketing pages keep rendering. They adapt the snake_case
 * demo records above into the camelCase row shape Drizzle returns.
 * ------------------------------------------------------------------ */
import type {
  AppRole as DbRole,
  FeedbackRow,
  MessageRow,
  Milestone,
  Project as DbProject,
  ProjectFile as DbFile,
} from "./db/schema";

const asDate = (value: string | null | undefined): Date | null =>
  value ? new Date(value) : null;

function adaptProject(p: Project): DbProject {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    summary: p.summary,
    clientId: p.client_id,
    pmId: p.pm_id,
    stage: p.stage,
    progress: p.progress,
    visibility: p.visibility,
    industry: p.industry,
    budget: p.budget,
    currency: p.currency,
    startDate: asDate(p.start_date),
    deadline: asDate(p.deadline),
    estimatedHours: Math.max(0, Math.round(((100 - p.progress) / 100) * 320)),
    hoursLogged: Math.round((p.progress / 100) * 320),
    tech: p.tech,
    cover: p.cover,
    createdAt: new Date(p.created_at),
    updatedAt: new Date(p.created_at),
  };
}

function adaptMilestone(m: ProjectMilestone): Milestone {
  return {
    id: m.id,
    projectId: m.project_id,
    title: m.title,
    stage: m.stage,
    status: m.status,
    assigneeId: m.assignee_id,
    dueDate: asDate(m.due_date),
    estimatedHours: m.status === "done" ? 0 : 24,
    orderIndex: m.order_index,
    createdAt: new Date(),
  };
}

function adaptFile(f: ProjectFile): DbFile {
  const kind =
    f.category === "design" ? ("image" as const) : ("document" as const);
  return {
    id: f.id,
    projectId: f.project_id,
    name: f.name,
    category: f.category,
    kind,
    url: `/files/${f.storage_path}`,
    thumbnailUrl: null,
    sizeKb: f.size_kb,
    version: f.version,
    visibleToClient: true,
    uploadedBy: f.uploaded_by,
    createdAt: new Date(f.created_at),
  };
}

function adaptFeedback(f: Feedback): FeedbackRow {
  return {
    id: f.id,
    projectId: f.project_id,
    authorId: f.author_id,
    category: f.category,
    body: f.body,
    resolved: f.resolved,
    createdAt: new Date(f.created_at),
  };
}

function adaptMessage(m: Message): MessageRow {
  return {
    id: m.id,
    projectId: m.project_id,
    senderId: m.sender_id,
    body: m.body,
    createdAt: new Date(m.created_at),
  };
}

export function publicProjectsFallback(): DbProject[] {
  return projects.filter((p) => p.visibility === "public").map(adaptProject);
}

export function viewerProjectsFallback(role: DbRole): DbProject[] {
  const visible =
    role === "client" ? projects.filter((p) => p.client_id === "u-101") : projects;
  return visible.map(adaptProject);
}

export function projectDetailFallback(projectId: string) {
  const found = getProject(projectId) ?? projects[0];
  return {
    project: adaptProject(found),
    milestones: projectMilestones(found.id).map(adaptMilestone),
    files: projectFiles(found.id).map(adaptFile),
    feedback: projectFeedback(found.id).map(adaptFeedback),
    messages: projectMessages(found.id).map(adaptMessage),
  };
}
