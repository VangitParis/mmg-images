import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → retourne la map des likes { id: count }
export async function GET() {
  try {
    const data = await kv.hgetall("likes");
    const likes: Record<string, number> = {};
    if (data) {
      Object.entries(data).forEach(([k, v]) => {
        likes[k] = Number(v) || 0;
      });
    }
    return NextResponse.json({ likes });
  } catch (err: any) {
    console.error("Erreur GET /api/likes:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST → incrémente/décrémente un like
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = String(body?.id || "");
    let delta = Number(body?.delta);
    if (!id) {
      return NextResponse.json({ success: false, error: "ID manquant" }, { status: 400 });
    }
    if (Number.isNaN(delta) || ![-1, 1].includes(delta)) {
      delta = 1;
    }

    const currentRaw = await kv.hget("likes", id);
    const current = Number(currentRaw) || 0;
    const next = Math.max(0, current + delta);
    await kv.hset("likes", { [id]: next });

    return NextResponse.json({ success: true, id, count: next });
  } catch (err: any) {
    console.error("Erreur POST /api/likes:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
