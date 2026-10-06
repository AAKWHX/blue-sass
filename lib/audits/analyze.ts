import type { AuditCheck, AuditReport } from "./types";
export const auditUploadLimits = { bytes: 3_000_000, files: 500, fileBytes: 500_000 } as const;
const ignoredFolders = /(^|\/)(node_modules|\.git|\.next|\.next-build|dist|build|coverage)(?: - kopie)?(\/|$)/i;
export function allowedSourcePath(input: string) {
  if (input.length > 240 || input.includes("\\") || input.includes("\0") || input.startsWith("/") || /^[a-z]:/i.test(input) || input.split("/").some(part => part === ".." || part === ".")) return false;
  if (ignoredFolders.test(input) || /(^|\/)\.env/i.test(input) || /(?:id_rsa|id_ed25519|private[-_]key|service[-_]account)/i.test(input) || /\.(pem|key|p12|pfx|zip|tar|gz|exe|dll)$/i.test(input)) return false;
  return /\.(html?|[cm]?jsx?|tsx?|css|json|md|txt|py|php|rb|go|java|cs|sql|ya?ml|xml|svg)$/i.test(input);
}
export function analyzeHtml(html: string): AuditCheck[] {
  const checks: AuditCheck[] = [];
  const add = (code: string, category: AuditCheck["category"], pass: boolean, count?: number) => checks.push({ code, category, status: pass ? "pass" : "warning", ...(count === undefined ? {} : { count }) });
  add("title", "seo", /<title\b[^>]*>[^<\s][\s\S]*?<\/title\s*>/i.test(html));
  add("description", "seo", /<meta\b(?=[^>]*\bname\s*=\s*["']description["'])(?=[^>]*\bcontent\s*=\s*["'][^"']+["'])[^>]*>/i.test(html));
  add("canonical", "seo", /<link\b[^>]*\brel\s*=\s*["']canonical["']/i.test(html));
  add("heading", "seo", /<h1\b/i.test(html));
  add("html_language", "accessibility", /<html\b[^>]*\blang\s*=\s*["'][a-z-]+["']/i.test(html));
  add("viewport", "accessibility", /<meta\b[^>]*\bname\s*=\s*["']viewport["']/i.test(html));
  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  const missing = images.filter(tag => !/\balt\s*=/i.test(tag)).length;
  add("image_alt", "accessibility", missing === 0, missing);
  const insecure = (html.match(/(?:src|href)\s*=\s*["']http:\/\//gi) ?? []).length;
  add("insecure_resources", "security", insecure === 0, insecure);
  checks.push({ code: "visual_browser", category: "performance", status: "not_tested" });
  checks.push({ code: "full_accessibility", category: "accessibility", status: "not_tested" });
  return checks;
}
const sourceRules: { code: string; category: AuditCheck["category"]; pattern: RegExp }[] = [
  { code: "secret_indicators", category: "security", pattern: /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|(?:password|api[_-]?key|client[_-]?secret)\s*[:=]\s*["'][^"'\s]{8,}["']/g },
  { code: "dynamic_execution", category: "security", pattern: /\beval\s*\(|\bnew\s+Function\s*\(/g },
  { code: "html_injection_review", category: "security", pattern: /dangerouslySetInnerHTML|\.innerHTML\s*=/g },
  { code: "tls_disabled", category: "security", pattern: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*["']?0/g },
];
export function analyzeSourceFiles(files: { path: string; text: string }[], skippedFiles = 0): AuditReport {
  const checks: AuditCheck[] = []; let bytes = 0;
  for (const file of files) {
    if (!allowedSourcePath(file.path)) throw new Error("FILE_BLOCKED");
    bytes += Buffer.byteLength(file.text, "utf8");
    if (Buffer.byteLength(file.text, "utf8") > auditUploadLimits.fileBytes || file.text.includes("\0")) throw new Error("FILE_BLOCKED");
    for (const rule of sourceRules) {
      const count = (file.text.match(rule.pattern) ?? []).length;
      if (count) checks.push({ code: rule.code, category: rule.category, status: "warning", file: file.path, count });
    }
    if (/\.html?$/i.test(file.path)) checks.push(...analyzeHtml(file.text).map(check => ({ ...check, file: file.path })));
  }
  if (!files.length || files.length > auditUploadLimits.files || bytes > auditUploadLimits.bytes) throw new Error("UPLOAD_LIMIT");
  if (!checks.some(check => check.code === "secret_indicators")) checks.push({ code: "secret_indicators", category: "security", status: "pass" });
  checks.push({ code: "files_read", category: "source", status: "pass", count: files.length });
  checks.push({ code: "runtime_database", category: "security", status: "not_tested" }, { code: "dependencies_database", category: "source", status: "not_tested" });
  return { version: 1, source: "files", target: "Source files", checks, scannedFiles: files.length, skippedFiles, bytes, fetchedPages: 0, generatedAt: new Date().toISOString() };
}
