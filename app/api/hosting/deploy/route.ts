import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/lib/db";
import { hostedSites } from "@/lib/db/schema";
import { AuthorisationError, requireViewer } from "@/lib/db/access";
import { createVercelDeployment } from "@/lib/hosting/vercel";
import { takeRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin } from "@/lib/api-security";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILES = 200;
const MAX_TOTAL = 4_000_000;
const forbidden = /(^|\/)(node_modules|\.git|\.next|\.vercel)(\/|$)|(^|\/)(\.env[^/]*|id_rsa|id_ed25519|.*\.(pem|key|p12|pfx))$/i;
const executable = /\.(exe|dll|msi|bat|cmd|ps1|sh|com|scr)$/i;

function cleanPath(raw: string) {
  const normalized = raw.replaceAll("\\", "/").replace(/^\/+/, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length > 1) parts.shift();
  const path = parts.join("/");
  if (!path || path.includes("..") || path.includes("\0") || path.length > 300) throw new Error("INVALID_PATH");
  return path;
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 42) || "project";
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!isDatabaseConfigured) return NextResponse.json({ error: "Hosting database is not configured." }, { status: 503 });
    const viewer = await requireViewer();
    if (!takeRateLimit(`hosting:${viewer.id}`, 2, 60 * 60_000)) return NextResponse.json({ error: "Please wait before starting another deployment." }, { status: 429 });
    if (!process.env.VERCEL_TOKEN) return NextResponse.json({ error: "Hosting is being configured. Please contact Blue Sass." }, { status: 503 });
    const form = await request.formData();
    const name = String(form.get("name") || "").trim().slice(0, 80);
    const framework = String(form.get("framework"));
    const files = form.getAll("files").filter((entry): entry is File => entry instanceof File);
    const rawPaths = JSON.parse(String(form.get("paths") || "[]")) as unknown;
    if (!name || !["static", "nextjs"].includes(framework) || !Array.isArray(rawPaths) || rawPaths.length !== files.length || files.length < 1 || files.length > MAX_FILES) {
      return NextResponse.json({ error: "Check the project name, type and selected folder." }, { status: 400 });
    }
    const prepared = await Promise.all(files.map(async (file, index) => ({ path: cleanPath(String(rawPaths[index])), bytes: new Uint8Array(await file.arrayBuffer()) })));
    const totalBytes = prepared.reduce((sum, file) => sum + file.bytes.byteLength, 0);
    if (totalBytes > MAX_TOTAL || prepared.some(file => forbidden.test(file.path) || executable.test(file.path))) {
      return NextResponse.json({ error: "The folder is too large or includes private/unsupported files. Remove .env, node_modules, build folders and executable files." }, { status: 400 });
    }
    if (framework === "static" && !prepared.some(file => /(^|\/)index\.html$/i.test(file.path))) return NextResponse.json({ error: "A static project must contain index.html." }, { status: 400 });
    if (framework === "nextjs" && !prepared.some(file => file.path === "package.json")) return NextResponse.json({ error: "A Next.js project must contain package.json at its root." }, { status: 400 });

    const projectName = `bs-${slugify(name)}-${viewer.id.slice(0, 8)}-${Date.now().toString(36)}`.slice(0, 100);
    const [site] = await db.insert(hostedSites).values({ userId: viewer.id, name, projectName, framework, fileCount: files.length, totalBytes }).returning();
    try {
      const deployment = await createVercelDeployment(projectName, framework as "static" | "nextjs", prepared);
      const status = deployment.readyState === "READY" ? "ready" : deployment.readyState === "ERROR" ? "failed" : "building";
      const url = deployment.alias?.[0] || deployment.url || null;
      await db.update(hostedSites).set({ deploymentId: deployment.id, url, status, updatedAt: new Date() }).where(eq(hostedSites.id, site.id));
      return NextResponse.json({ ok: true, id: site.id, status, url });
    } catch (error) {
      const message = error instanceof Error && error.message === "HOSTING_NOT_CONFIGURED" ? "Hosting is not configured." : "Deployment could not be started.";
      await db.update(hostedSites).set({ status: "failed", errorMessage: message, updatedAt: new Date() }).where(eq(hostedSites.id, site.id));
      return NextResponse.json({ error: message, id: site.id }, { status: 502 });
    }
  } catch (error) {
    if (error instanceof AuthorisationError) {
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "UNTRUSTED_ORIGIN") {
      return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unable to process this deployment." }, { status: 400 });
  }
}
