import { handleUpload, HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,

      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],

          // ✅ CES OPTIONS SONT ICI ET SEULEMENT ICI
          addRandomSuffix: true,
          allowOverwrite: false,
          cacheControlMaxAge: 31536000,
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log("✅ Upload terminé :", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err: any) {
    console.error("❌ BLOB TOKEN ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
