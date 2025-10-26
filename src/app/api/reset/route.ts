import { kv } from "@/lib/kv";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// ⚠️ À n'utiliser qu'en dev (puis supprime la route après)
export async function DELETE() {
  try {
    await kv.del("works");
    return NextResponse.json({ success: true, message: "✅ KV vidé avec succès" });
  } catch (err: any) {
    console.error("Erreur reset KV:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur inconnue" },
      { status: 500 }
    );
  }
}
