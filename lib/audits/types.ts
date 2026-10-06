export type AuditCategory = "security" | "seo" | "accessibility" | "performance" | "links" | "source";
export type AuditCheck = { code: string; category: AuditCategory; status: "pass" | "warning" | "not_tested"; count?: number; file?: string; metric?: number };
export type AuditReport = {
  version: 1; source: "url" | "files"; target: string; checks: AuditCheck[];
  scannedFiles: number; skippedFiles: number; bytes: number; fetchedPages: number;
  generatedAt: string;
  pageKey?: string;
  pageUrl?: string;
  pages?: { url: string; method: "GET" | "HEAD"; status: number | null }[];
};
