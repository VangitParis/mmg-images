import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const filePath = path.join(process.cwd(), "src/lib/pages.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: "Fichier pages.json introuvable." },
        { status: 404 }
      );
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const updated = data.filter((p: any) => p.slug !== params.slug);

    if (updated.length === data.length) {
      return NextResponse.json(
        { success: false, error: "Page non trouvée." },
        { status: 404 }
      );
    }

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur suppression page:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
