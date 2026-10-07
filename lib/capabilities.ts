export const capabilityKeys = [
  "leads.read", "leads.manage", "projects.read_assigned", "projects.read_all", "projects.edit_all", "projects.edit_assigned",
  "projects.assign", "projects.stage", "billing.approve", "portfolio.manage", "reviews.manage",
  "announcements.send", "cms.manage", "marketplace.manage",
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
