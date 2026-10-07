import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/lib/api-security";
import { requireViewer, assertCanWrite, AuthorisationError } from "@/lib/db/access";
import { isDatabaseConfigured } from "@/lib/db";
import { reserveAudit, finishAudit } from "@/lib/db/audits";
import { auditUrl } from "@/lib/audits/network";
import { analyzeWebsite } from "@/lib/audits/website";
import { analyzeSourceFiles, allowedSourcePath, auditUploadLimits } from "@/lib/audits/analyze";
import { takeRateLimit } from "@/lib/rate-limit";
export const runtime = "nodejs";
export const maxDuration = 60;
const safeErrorCodes = new Set(["URL_BLOCKED", "URL_UNAVAILABLE", "HTML_REQUIRED", "FILE_BLOCKED", "UPLOAD_LIMIT", "AUDIT_BUSY", "AUDIT_QUOTA", "SITE_QUOTA"]);
export async function POST(request: Request) {
  let id: string | undefined; let userId: string | undefined;
  try {
    assertSameOrigin(request);
    const viewer = await requireViewer(); assertCanWrite(viewer); userId = viewer.id;
    if (!isDatabaseConfigured) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });
    if (!(await takeRateLimit(`audit:${viewer.id}`, 6, 60_000))) return NextResponse.json({ error: "AUDIT_BUSY" }, { status: 429 });
    const contentLength = Number(request.headers.get("content-length"));
    if (contentLength > 4_000_000) return NextResponse.json({ error: "UPLOAD_LIMIT" }, { status: 413 });
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    const chunks: Uint8Array[] = []; let bodyBytes = 0;
    try {
      while (true) {
        const chunk = await reader.read(); if (chunk.done) break;
        bodyBytes += chunk.value.byteLength;
        if (bodyBytes > 4_000_000) { await reader.cancel(); throw new Error("UPLOAD_LIMIT"); }
        chunks.push(chunk.value);
      }
    } finally { reader.releaseLock(); }
    const body = new Uint8Array(bodyBytes); let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
    const form = await new Request(request.url, { method: "POST", headers: request.headers, body }).formData();
    if (form.get("consent") !== "yes") return NextResponse.json({ error: "CONSENT_REQUIRED" }, { status: 400 });
    const source = form.get("source");
    if (source === "url") {
      const input = z.string().trim().min(8).max(500).parse(form.get("url"));
      const url = auditUrl(input);
      id = await reserveAudit(viewer.id, "url", url.origin);
      const report = await analyzeWebsite(url.href); await finishAudit(id, viewer.id, report);
    } else if (source === "files") {
      const paths = z.array(z.string().max(240)).max(auditUploadLimits.files).parse(JSON.parse(String(form.get("paths") || "[]")));
      const files = form.getAll("files");
      const target = z.string().trim().min(2).max(80).parse(form.get("name"));
      if (!files.length || files.length !== paths.length || files.length > auditUploadLimits.files || new Set(paths).size !== paths.length) throw new Error("UPLOAD_LIMIT");
      let bytes = 0;
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (!(file instanceof File) || !allowedSourcePath(paths[index]) || file.size > auditUploadLimits.fileBytes) throw new Error("FILE_BLOCKED");
        bytes += file.size;
      }
      if (bytes > auditUploadLimits.bytes) throw new Error("UPLOAD_LIMIT");
      id = await reserveAudit(viewer.id, "files", target);
      const input: { path: string; text: string }[] = [];
      for (let index = 0; index < files.length; index++) input.push({ path: paths[index], text: await (files[index] as File).text() });
      const skipped = Math.max(0, Math.min(100_000, Number(form.get("skipped")) || 0));
      const report = analyzeSourceFiles(input, skipped); report.target = target;
      await finishAudit(id, viewer.id, report);
    } else return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    return NextResponse.json({ id }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (id && userId) { try { await finishAudit(id, userId, null); } catch { /* A stale claim is released on the next request. */ } }
    const code = error instanceof Error ? error.message : "INVALID_INPUT";
    const unauthorised = error instanceof AuthorisationError || code === "UNTRUSTED_ORIGIN";
    return NextResponse.json({ error: unauthorised ? "UNAUTHORISED" : safeErrorCodes.has(code) ? code : "INVALID_INPUT" }, { status: unauthorised ? 403 : 400 });
  }
}
