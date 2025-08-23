import { NextResponse } from "next/server";
import srts from "@/data/srts.json";

export async function POST(req: Request) {
  const { srtId, brId } = await req.json();
  const srt = (srts as any).srts.find((s: any) => s.id === srtId);
  const row = srt?.excel_rows.find((r: any) => r.br_id === brId);
  if (!row) return NextResponse.json({ error: "BR not found" }, { status: 404 });

  const ac = [
    `Given a valid account when initiating "${row.title}" then the system validates prerequisites`,
    `When processing "${row.title}" then record audit events`,
    `Then notify the account owner of the outcome`
  ];
  return NextResponse.json({
    acceptance_criteria: ac,
    provenance: [{ source: `excel:${row.row_id}`, snippet: row.title }]
  });
}
