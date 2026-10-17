export type PortfolioStatus = "comingSoon" | "inDevelopment" | "completed" | "published";
/** Publication requires a completed lifecycle AND an explicitly approved live HTTPS link. */
export function portfolioStatus(stage: string, liveUrl: string): PortfolioStatus {
  if (stage === "completed") return safePortfolioUrl(liveUrl) ? "published" : "completed";
  return stage === "planning" ? "comingSoon" : "inDevelopment";
}
export function safePortfolioUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}
