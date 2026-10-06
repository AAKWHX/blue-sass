import { validCapabilities } from "./capabilities";
export function canChangeAccount(actorId: string, targetId: string, ownerId: string) {
  return actorId === ownerId && targetId !== ownerId;
}
export function canAcceptInvitation(input: { email: string; invitationEmail: string; expiresAt: Date; acceptedAt: Date | null; revokedAt: Date | null; creatorId: string; ownerId: string; permissions: unknown }, now = new Date()) {
  return input.email.toLowerCase() === input.invitationEmail.toLowerCase() && input.creatorId === input.ownerId && !input.acceptedAt && !input.revokedAt && input.expiresAt > now && validCapabilities(input.permissions);
}
