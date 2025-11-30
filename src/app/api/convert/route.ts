// app/api/convert/route.ts
import { NextResponse } from "next/server";
import { convertToWebpWithCloudinary } from "@/utils/convertToWebpCloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni." },
        { status: 400 }
      );
    }

    // 1️⃣ On lit le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 2️⃣ Conversion via Cloudinary → WebP (ArrayBuffer)
    const webpArrayBuffer = await convertToWebpWithCloudinary(arrayBuffer);

    // 3️⃣ On renvoie l'ArrayBuffer directement :
    // `ArrayBuffer` est accepté comme BodyInit par `Response`
    return new Response(webpArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("❌ /api/convert error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur conversion" },
      { status: 500 }
    );
  }
}
