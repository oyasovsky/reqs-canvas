import { NextResponse } from "next/server";
import srts from "@/data/srts.json";

export async function POST(req: Request) {
  const { srtId } = await req.json();
  const srt = (srts as any).srts.find((s: any) => s.id === srtId);
  if (!srt) return NextResponse.json({ error: "SRT not found" }, { status: 404 });

  const pack = {
    overview: `Solution intent for ${srt.title}`,
    context_actors: ["Customer", "CSR", "BillingSvc", "AccountSvc", "NotificationSvc"],
    app_landscape: ["BillingSvc", "AccountSvc", "ProvisioningSvc", "InventorySvc", "CRM", "NotificationSvc", "PaymentsSvc"],
    dependency_map_snapshot_id: "graph:v1",
    data_flows: ["AccountSvc → BillingSvc: finalize bill", "CRM → NotificationSvc: event CustomerUpdated"],
    nfrs: [{ category: "availability", target: "99.9%" }, { category: "latency", target: "P95<500ms" }],
    risks: ["Orphan charges if finalize fails"],
    open_questions: ["Who owns installments termination logic?"],
    provenance: [{ source: "meeting:m1", snippet: srt.meeting_notes?.[0]?.text || "" }]
  };

  return NextResponse.json({ solution_intent: pack });
}
