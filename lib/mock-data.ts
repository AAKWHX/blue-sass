import type { Profile, UserRole, Project, ProjectMilestone, ProjectFile, Feedback, Message, AppRole } from "./demo-types";
import type { Project as DbProject, AppRole as DbRole, Milestone, ProjectFile as DbFile, FeedbackRow, MessageRow } from "./db/schema";

export interface Task { id: string; project_id: string; title: string; assignee_id: string; status: "todo" | "in_progress" | "blocked" | "done"; priority: "low" | "medium" | "high" | "critical"; due_date: string; hours: number; }
export const profiles: Profile[] = [];
export const userRoles: UserRole[] = [];
export const projects: Project[] = [];
export const milestones: ProjectMilestone[] = [];
export const files: ProjectFile[] = [];
export const feedbackItems: Feedback[] = [];
export const messages: Message[] = [];
export const tasks: Task[] = [];
export const kpis = { revenueYtd: 0, activeProjects: 0, utilisation: 0, overdueTasks: 0, revenueByMonth: [] as { month: string; value: number }[] };
export const testimonials: { quote: string; author: string; role: string }[] = [];
export const industries: string[] = [];
export function getProfile(_id: string): Profile | undefined { return undefined; }
export function getRole(_userId: string): AppRole { throw new Error("QA_MOCK_ROLE_UNAVAILABLE"); }
export function getProject(_idOrSlug: string): Project | undefined { return undefined; }
export function projectMilestones(_projectId: string): ProjectMilestone[] { return []; }
export function projectFiles(_projectId: string): ProjectFile[] { return []; }
export function projectFeedback(_projectId: string): Feedback[] { return []; }
export function projectMessages(_projectId: string): Message[] { return []; }
export function publicProjectsFallback(): DbProject[] { return []; }
export function viewerProjectsFallback(_role: DbRole): DbProject[] { return []; }
export function projectDetailFallback(_projectId: string): { project: DbProject; milestones: Milestone[]; files: DbFile[]; feedback: FeedbackRow[]; messages: MessageRow[] } { throw new Error("QA_MOCK_PROJECT_UNAVAILABLE"); }
