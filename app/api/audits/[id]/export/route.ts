import { NextResponse } from "next/server";
import { z } from "zod";
import { requireViewer } from "@/lib/db/access";
import { ownedReport, toolEntitlement } from "@/lib/db/audits";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await requireViewer(); const { id } = await params;
    if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    const entitlement = await toolEntitlement(viewer.id);
    if (!entitlement.jsonExport) return NextResponse.json({ error: "PLAN_REQUIRED" }, { status: 403 });
    const row = await ownedReport(id); if (!row?.report || row.status !== "completed") return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return new Response(JSON.stringify(row.report, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="bluesass-review-${id}.json"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return NextResponse.json({ error: "UNAUTHORISED" }, { status: 403 }); }
}
