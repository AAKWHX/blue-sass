import type { AppRole } from "./demo-types";

export type AdminModule = "dashboard" | "projects" | "tasks" | "team" | "clients" | "cmsStats" | "cmsPortfolio";

/** Mirrors the RLS policies defined in schema.sql. */
export const modulePermissions: Record<AdminModule, AppRole[]> = {
  dashboard: ["super_admin", "admin", "pm"],
  projects: ["super_admin", "admin", "pm", "employee"],
  tasks: ["super_admin", "admin", "pm", "employee"],
  team: ["super_admin", "admin", "pm"],
  clients: ["super_admin", "admin"],
  cmsStats: ["super_admin", "admin"],
  cmsPortfolio: ["super_admin", "admin", "pm"],
};

export function canAccess(role: AppRole, module: AdminModule): boolean {
  return modulePermissions[module].includes(role);
}

export const roleOrder: AppRole[] = ["super_admin", "admin", "pm", "employee", "client"];

export function canEditProject(role: AppRole): boolean {
  return role === "super_admin" || role === "admin" || role === "pm";
}

export function canManageFinance(role: AppRole): boolean {
  return role === "super_admin" || role === "admin";
}
