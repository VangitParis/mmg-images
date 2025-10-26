import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "id manquant" }, { status: 400 });
    }

    // Lire toute la liste
    const items = await kv.lrange("works", 0, -1);

    // Normaliser en objets JS (gère string JSON ou objets déjà sérialisés)
    const parsed = items.map((it: any) =>
      typeof it === "string" ? JSON.parse(it) : it
    );

    // Vérifier présence
    const exists = parsed.find((p: any) => String(p.id) === String(id));
    if (!exists) {
      return NextResponse.json({ success: false, error: "Oeuvre introuvable" }, { status: 404 });
    }

    // Filtrer la liste
    const remaining = parsed.filter((p: any) => String(p.id) !== String(id));

    // Réécrire la liste proprement (supprime la clé puis push les restants)
    await kv.del("works");
    if (remaining.length) {
      // On push en ordre (rpush pour garder l'ordre original)
      for (const item of remaining) {
        await kv.rpush("works", JSON.stringify(item));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur suppression work:", err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
