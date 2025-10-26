import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

/**
 * Upload d’image pour les pages statiques (About, Mentions légales, etc.)
 * - Renomme automatiquement le fichier en fonction du slug.
 * - Écrase l’ancienne version si elle existe (garantit un lien unique SEO).
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const slug = (formData.get("slug") as string | null)?.toLowerCase().replace(/\s+/g, "-");

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    // 🧩 Dossier /public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 🔖 Nom de fichier SEO : slug.webp (fallback = timestamp)
    const fileName = slug ? `${slug}.webp` : `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, fileName);

    // 💾 Conversion File → Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 🧹 Supprime l’ancien fichier s’il existe déjà (mise à jour)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error("Erreur uploadPageImage:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
