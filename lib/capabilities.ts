export const capabilityKeys = [
  "leads.read", "leads.manage", "projects.read_assigned", "projects.read_all", "projects.edit_all", "projects.edit_assigned",
  "projects.assign", "projects.stage", "billing.approve",
  "announcements.send", "cms.manage",
] as const;
export type Capability = typeof capabilityKeys[number];
export type PermissionSubject = { isOwner: boolean; permissions: readonly string[] };
export function hasCapability(subject: PermissionSubject, capability: Capability) {
  return subject.isOwner || subject.permissions.includes(capability);
}
export function canOpenAdmin(subject: PermissionSubject) {
  return subject.isOwner || subject.permissions.some(value => (capabilityKeys as readonly string[]).includes(value));
}
export function validCapabilities(values: unknown): values is Capability[] {
  return Array.isArray(values) && values.length <= capabilityKeys.length && values.every(value => typeof value === "string" && (capabilityKeys as readonly string[]).includes(value)) && new Set(values).size === values.length;
}

export const executionProfile = Object.freeze({
  mode: process.env.BLUE_SASS_R22_PREVIEW === "1" || process.env.QA_PUBLIC_ONLY === "1" ? "local-qa-preview" : process.env.BLUE_SASS_PRODUCTION_RELEASE === "approved" ? "production-public-release" : "locked",
  isLocalQaPreview: process.env.BLUE_SASS_R22_PREVIEW === "1" || process.env.QA_PUBLIC_ONLY === "1",
  isProductionPublicRelease: process.env.BLUE_SASS_PRODUCTION_RELEASE === "approved" && process.env.QA_PUBLIC_ONLY !== "1" && process.env.BLUE_SASS_R22_PREVIEW !== "1",
});

export const publicFeatureFlags = Object.freeze({
  accounts: false,
  portal: false,
  admin: false,
  projectWorkflows: false,
  inquiries: false,
  payments: false,
});

export function isTemporarilyDisabledPath(pathname: string): boolean {
  if (/^\/api\/inquiries(?:\/|$)/.test(pathname)) {
    return !publicFeatureFlags.inquiries;
  }
  if (/^\/api\/(?:auth|paypal|stripe)(?:\/|$)/.test(pathname)) {
    return !publicFeatureFlags.payments && !publicFeatureFlags.accounts;
  }
  const parts = pathname.split("/").filter(Boolean);
  const segment = parts[1];
  if (!segment) return false;
  if (["login", "register", "forgot-password", "verify", "staff"].includes(segment)) {
    return !publicFeatureFlags.accounts;
  }
  if (segment === "portal") return !publicFeatureFlags.portal;
  if (segment === "admin") return !publicFeatureFlags.admin;
  if (["create-project", "quote"].includes(segment)) return !publicFeatureFlags.projectWorkflows;
  return false;
}
