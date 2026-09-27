/** Shared UI/server policy; mutation callers must also hold the project row lock. */
export function canChangeRequest(project: { clientId: string | null; stage: string } | null | undefined, viewerId: string, state: { locked: boolean; cancelled: boolean }) {
 return Boolean(project && project.clientId === viewerId && project.stage === "planning" && !state.locked && !state.cancelled);
}
