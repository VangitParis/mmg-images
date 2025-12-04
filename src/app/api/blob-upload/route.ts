import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req,

      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jxl",
          ],
          maxSizeInBytes: 50 * 1024 * 1024, // 50 Mo
          tokenPayload: JSON.stringify({
            source: "mmg-admin",
            pathname,
          }),
        };
      },

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("✅ Upload Blob terminé :", blob.url);
        console.log("📦 Payload reçu :", tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err: any) {
    console.error("❌ BLOB UPLOAD 500:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur serveur blob-upload" },
      { status: 400 }
    );
  }
}
