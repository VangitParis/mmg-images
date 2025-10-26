import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

    const worksPath = path.join(process.cwd(), "src/lib/works.json");
    if (!fs.existsSync(worksPath)) fs.writeFileSync(worksPath, "[]", "utf-8");
    const data = JSON.parse(fs.readFileSync(worksPath, "utf-8"));

    const idx = data.findIndex((w: any) => String(w.id) === String(id));
    if (idx === -1) return NextResponse.json({ error: "œuvre introuvable" }, { status: 404 });

    // supprime fichier associé
    const toDelete = data[idx];
    if (toDelete?.src?.startsWith("/uploads/")) {
      const full = path.join(process.cwd(), "public", toDelete.src);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    }

    data.splice(idx, 1);
    fs.writeFileSync(worksPath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (err:any) {
    console.error("DELETE /api/delete:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
