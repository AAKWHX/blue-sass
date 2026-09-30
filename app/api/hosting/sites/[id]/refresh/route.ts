import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { hostedSites } from "@/lib/db/schema";
import { AuthorisationError, requireViewer } from "@/lib/db/access";
import { getVercelDeployment } from "@/lib/hosting/vercel";
import { assertSameOrigin } from "@/lib/api-security";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const viewer = await requireViewer();
    const { id } = await params;
    const [site] = await db.select().from(hostedSites).where(and(eq(hostedSites.id, id), eq(hostedSites.userId, viewer.id))).limit(1);
    if (!site?.deploymentId) return NextResponse.json({ error: "Deployment not found." }, { status: 404 });
    const deployment = await getVercelDeployment(site.deploymentId);
    const status = deployment.readyState === "READY" ? "ready" : ["ERROR", "CANCELED"].includes(deployment.readyState) ? "failed" : "building";
    const url = deployment.alias?.[0] || deployment.url || site.url;
    await db.update(hostedSites).set({ status, url, errorMessage: deployment.errorMessage || null, updatedAt: new Date() }).where(eq(hostedSites.id, site.id));
    return NextResponse.json({ ok: true, status, url });
  } catch (error) {
    if (error instanceof AuthorisationError) {
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "UNTRUSTED_ORIGIN") {
      return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
    }
    return NextResponse.json({ error: "Could not refresh deployment status." }, { status: 400 });
  }
}
