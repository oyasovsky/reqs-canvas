import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";

const nano = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 10);

export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.confirm) {
    return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
  }
  const { brId } = body;
  const created = [
    { type: "BusinessRequirement", id: `br-${nano()}`, ref: brId },
    { type: "Epic", id: `ep-${nano()}`, ref: brId },
    { type: "Feature", id: `ft-${nano()}`, ref: brId }
  ];
  return NextResponse.json({ created, timestamp: Date.now() });
}
