import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

// 📦 Récupération de toutes les catégories et modèles
export async function GET() {
  const data = (await kv.get("pricing")) || {};
  return NextResponse.json(data);
}

// 💾 Sauvegarde (mise à jour complète)
export async function POST(req: Request) {
  const body = await req.json();
  await kv.set("pricing", body);
  return NextResponse.json({ success: true });
}
