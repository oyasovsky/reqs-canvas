import { NextResponse } from "next/server";
import srts from "@/data/srts.json";

const rules: Record<string, string[]> = {
  billing: ["BillingSvc", "PaymentsSvc"],
  line: ["ProvisioningSvc", "AccountSvc", "InventorySvc", "BillingSvc"],
  address: ["AccountSvc", "BillingSvc"],
  discount: ["BillingSvc", "CRM"],
  notification: ["NotificationSvc", "CRM"]
};

export async function POST(req: Request) {
  const { srtId, brId } = await req.json();
  const srt = (srts as any).srts.find((s: any) => s.id === srtId);
  const row = srt?.excel_rows.find((r: any) => r.br_id === brId);
  if (!row) return NextResponse.json({ error: "BR not found" }, { status: 404 });

  const text = (row.title + " " + (row.notes || "")).toLowerCase();
  const hits = new Set<string>();
  Object.entries(rules).forEach(([k, apps]) => { if (text.includes(k)) apps.forEach(a => hits.add(a)); });
  if (row.impacted_apps_hint) row.impacted_apps_hint.forEach((a: string) => hits.add(a));

  const impacted = Array.from(hits).map(app => ({
    app,
    reason: "rule or hint match",
    confidence: 0.7,
    provenance: [{ source: `excel:${row.row_id}`, snippet: row.title }]
  }));

  return NextResponse.json({ impacted });
}
