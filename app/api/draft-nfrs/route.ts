import { NextResponse } from "next/server";
import srts from "@/data/srts.json";

export async function POST(req: Request) {
  const { srtId, brId } = await req.json();
  const srt = (srts as any).srts.find((s: any) => s.id === srtId);
  const row = srt?.excel_rows.find((r: any) => r.br_id === brId);
  if (!row) return NextResponse.json({ error: "BR not found" }, { status: 404 });

  const nfrs = [
    { category: "availability", target: "99.9%", notes: "CSR-facing workflow" },
    { category: "latency", target: "P95<500ms", notes: "UI response during flow" },
    { category: "security", target: "PII redaction", notes: "Mask sensitive fields in logs" }
  ];
  return NextResponse.json({
    nfrs,
    provenance: [{ source: `excel:${row.row_id}`, snippet: row.title }]
  });
}
