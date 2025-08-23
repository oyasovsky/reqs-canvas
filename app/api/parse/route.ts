import { NextResponse } from "next/server";
import srts from "@/data/srts.json";
import type { BR } from "@/lib/types";

export async function POST(req: Request) {
  const { srtId } = await req.json();
  const srt = (srts as any).srts.find((s: any) => s.srt_id === srtId);
  if (!srt) return NextResponse.json({ error: "SRT not found" }, { status: 404 });

  // The new structure already has properly formatted BRs
  const brs: BR[] = srt.business_requirements;

  return NextResponse.json({ brs });
}
