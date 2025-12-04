// src/app/api/blob-upload/route.ts
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      // 🔑 Génère le token que le client va utiliser pour upload()
      onBeforeGenerateToken: async (pathname: string) => {
        console.log("🔑 Token pour :", pathname);

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jxl",
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 Mo côté Blob
          addRandomSuffix: true,                // ⬅️ évite "blob already exists"
        };
      },

      // Callback quand l’upload côté client est terminé
      onUploadCompleted: async ({ blob }) => {
        console.log("✅ Upload vers Vercel Blob terminé :", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("❌ blob-upload error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur blob-upload" },
      { status: 400 }
    );
  }
}
