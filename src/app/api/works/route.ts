import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await kv.lrange("works", 0, -1);
    const works = items.map((item) =>
  typeof item === "string" ? JSON.parse(item) : item
);

    return NextResponse.json(works);
  } catch (err: any) {
    console.error("Erreur lecture works:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
