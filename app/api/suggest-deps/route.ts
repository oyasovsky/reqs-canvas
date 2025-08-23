import { NextResponse } from "next/server";
import srts from "@/data/srts.json";

const depHeuristics = [
  { from: "AccountSvc", to: "BillingSvc", type: "API" },
  { from: "ProvisioningSvc", to: "InventorySvc", type: "API" },
  { from: "CRM", to: "NotificationSvc", type: "Event" },
  { from: "BillingSvc", to: "PaymentsSvc", type: "SharedDB" }
] as const;

export async function POST(req: Request) {
  const { srtId, brId, apps } = await req.json();
  const srt = (srts as any).srts.find((s: any) => s.id === srtId);
  const row = srt?.excel_rows.find((r: any) => r.br_id === brId);
  if (!row) return NextResponse.json({ error: "BR not found" }, { status: 404 });

  const set = new Set(apps || row.impacted_apps_hint || []);
  const candidates = depHeuristics
    .filter(h => set.has(h.from) && set.has(h.to))
    .map(h => ({
      from: h.from,
      to: h.to,
      type: h.type,
      confidence: 0.72,
      provenance: [{ source: `excel:${row.row_id}`, snippet: row.title }]
    }));

  return NextResponse.json({ dependencies: candidates });
}
