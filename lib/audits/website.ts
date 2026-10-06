import "server-only";
import { auditUrl, readPublicPage } from "./network";
import { analyzeHtml } from "./analyze";
import type { AuditCheck, AuditReport } from "./types";
import { createHash } from "node:crypto";
export async function analyzeWebsite(input: string): Promise<AuditReport> {
  const page = await readPublicPage(input);
  const expiresAt = Date.now() + 16_000;
  if (!page.headers["content-type"]?.toLowerCase().includes("text/html")) throw new Error("HTML_REQUIRED");
  const checks = analyzeHtml(page.html);
  checks.unshift({ code: "http_status", category: "links", status: page.status >= 200 && page.status < 300 ? "pass" : "warning", metric: page.status });
  checks.push({ code: "https", category: "security", status: page.url.protocol === "https:" ? "pass" : "warning" });
  const headers = page.headers;
  checks.push({ code: "csp", category: "security", status: headers["content-security-policy"] ? "pass" : "warning" });
  checks.push({ code: "hsts", category: "security", status: Number(headers["strict-transport-security"]?.match(/max-age\s*=\s*(\d+)/i)?.[1] ?? 0) > 0 ? "pass" : "warning" });
  checks.push({ code: "nosniff", category: "security", status: headers["x-content-type-options"]?.trim().toLowerCase() === "nosniff" ? "pass" : "warning" });
  checks.push({ code: "referrer", category: "security", status: ["no-referrer", "same-origin", "strict-origin", "strict-origin-when-cross-origin"].includes(headers["referrer-policy"]?.trim().toLowerCase()) ? "pass" : "warning" });
  checks.push({ code: "framing", category: "security", status: /^(deny|sameorigin)$/i.test(headers["x-frame-options"] ?? "") || /frame-ancestors\s+(?:'none'|'self')(?:\s|;|$)/i.test(headers["content-security-policy"] ?? "") ? "pass" : "warning" });
  checks.push({ code: "html_fetch_ms", category: "performance", status: "pass", metric: page.elapsedMs });
  checks.push({ code: "html_bytes", category: "performance", status: "pass", metric: page.bytes });
  const links = new Set<string>();
  for (const match of page.html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"'#]+)["']/gi)) {
    try { const url = auditUrl(new URL(match[1], page.url).href); if (url.origin === page.url.origin && url.pathname !== page.url.pathname) links.add(url.href); } catch { /* Non-HTTP and private links are not requested. */ }
    if (links.size === 3) break;
  }
  let tested = 0; let unavailable = 0;
  const pages: NonNullable<AuditReport["pages"]> = [{ url: page.url.href, method: "GET", status: page.status }];
  for (const link of links) {
    try { const result = await readPublicPage(link, "HEAD", 0, expiresAt); tested += 1; pages.push({ url: result.url.href, method: "HEAD", status: result.status }); if (result.status >= 400) unavailable += 1; } catch { unavailable += 1; pages.push({ url: link, method: "HEAD", status: null }); }
  }
  checks.push({ code: "sample_links", category: "links", status: unavailable ? "warning" : tested ? "pass" : "not_tested", count: unavailable });
  checks.push({ code: "full_crawl", category: "links", status: "not_tested" }, { code: "runtime_database", category: "security", status: "not_tested" });
  return { version: 1, source: "url", target: page.url.origin, pageUrl: page.url.href, pages, checks: checks as AuditCheck[], scannedFiles: 0, skippedFiles: 0, bytes: page.bytes, fetchedPages: 1, generatedAt: new Date().toISOString(), pageKey: createHash("sha256").update(page.url.pathname).digest("hex") };
}
