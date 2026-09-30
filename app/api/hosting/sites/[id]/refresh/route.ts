import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { hostedSites } from "@/lib/db/schema";
import { requireViewer } from "@/lib/db/access";
import { getVercelDeployment } from "@/lib/hosting/vercel";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await requireViewer();
    const { id } = await params;
    const [site] = await db.select().from(hostedSites).where(and(eq(hostedSites.id, id), eq(hostedSites.userId, viewer.id))).limit(1);
    if (!site?.deploymentId) return NextResponse.json({ error: "Deployment not found." }, { status: 404 });
    const deployment = await getVercelDeployment(site.deploymentId);
    const status = deployment.readyState === "READY" ? "ready" : ["ERROR", "CANCELED"].includes(deployment.readyState) ? "failed" : "building";
    const url = deployment.alias?.[0] || deployment.url || site.url;
    await db.update(hostedSites).set({ status, url, errorMessage: deployment.errorMessage || null, updatedAt: new Date() }).where(eq(hostedSites.id, site.id));
    return NextResponse.json({ ok: true, status, url });
  } catch {
    return NextResponse.json({ error: "Could not refresh deployment status." }, { status: 400 });
  }
}
