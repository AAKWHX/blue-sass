export function auditTargetKey(source: string, target: string) {
  if (source === "url") {
    try { return `url:${new URL(target).hostname.toLowerCase().replace(/^www\./, "")}`; } catch { return `url:${target.toLowerCase()}`; }
  }
  return `files:${target.trim().toLowerCase()}`;
}
