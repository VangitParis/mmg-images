// // app/api/upload/route.ts

// import { put } from "@vercel/blob";
// import { kv } from "@/lib/kv";
// import { NextResponse } from "next/server";

// export const runtime = "nodejs";
// export const maxDuration = 60; // 60 secondes pour les gros fichiers

// export async function POST(req: Request) {
//   try {
//     const sharp = (await import("sharp")).default;
//     const formData = await req.formData();

//     const file = formData.get("file") as File | null;
//     if (!file) {
//       return NextResponse.json(
//         { success: false, error: "Aucun fichier" },
//         { status: 400 }
//       );
//     }

//     const title = (formData.get("title") as string) || "";
//     const location = (formData.get("location") as string) || "";
//     const category = (formData.get("category") as string) || "";
//     const prices = (formData.get("prices") as string) || "";
//     const alt = (formData.get("alt") as string) || "";
//     const story = (formData.get("story") as string) || "";

//     console.log(
//       `📸 Fichier reçu : ${file.name} (${file.type || "unknown"}, ${(file.size / 1024 / 1024).toFixed(2)} MB)`
//     );

//     // 🔍 Conversion en Buffer
//     const arrayBuffer = await file.arrayBuffer();
//     const inputBuffer = Buffer.from(arrayBuffer);

//     let processedBuffer: Buffer;

//     try {
//       // Meta pour debug
//       const metadata = await sharp(inputBuffer).metadata();
//       console.log(
//         `📐 Format détecté par Sharp : ${metadata.format} | ${metadata.width}x${metadata.height}px`
//       );

//       // 🖋️ Watermark SVG
//       const watermarkSvg = `
// <svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
//   <style>
//     text { font-family: Arial, sans-serif; }
//   </style>
//   <text x="50%" y="50%" text-anchor="middle" fill="white"
//     font-size="48" opacity="0.35" transform="rotate(-10, 400, 100)">
//     MMG Images
//   </text>
// </svg>
// `;
//       const watermark = Buffer.from(watermarkSvg, "utf-8");

//       // 🎨 Traitement image final (standardisation en WebP)
//       processedBuffer = await sharp(inputBuffer)
//         .resize(1600, null, {
//           fit: "inside",
//           withoutEnlargement: true,
//         })
//         .composite([{ input: watermark, gravity: "center" }])
//         .webp({ quality: 80, effort: 4 })
//         .toBuffer();

//       console.log(
//         `✅ Image traitée, taille finale : ${(processedBuffer.length / 1024).toFixed(2)} KB`
//       );
//     } catch (sharpError: any) {
//       console.error("❌ Erreur Sharp :", sharpError.message);
//       return NextResponse.json(
//         {
//           success: false,
//           error:
//             "Format non supporté par le serveur. Merci d'envoyer une image compatible (JPEG, PNG, WebP ou image convertie).",
//         },
//         { status: 400 }
//       );
//     }

//     // 🧼 Slugification du titre pour le nom de fichier
//     const sanitizedTitle = title
//       .toLowerCase()
//       .normalize("NFD")
//       .replace(/[\u0300-\u036f]/g, "")
//       .replace(/[^a-z0-9]/g, "-")
//       .replace(/-+/g, "-")
//       .replace(/^-|-$/g, "")
//       .substring(0, 50);

//     const fileName = `${Date.now()}-${sanitizedTitle || "image"}.webp`;

//     // 📤 Upload vers Vercel Blob
//     const blob = await put(fileName, processedBuffer, {
//       access: "public",
//       contentType: "image/webp",
//     });

//     console.log(`📤 Uploadé sur Blob : ${blob.url}`);

//     // 💶 Parsing du champ prices "format - prixEnCentimes"
//     const parsedPrices =
//       prices
//         ?.split("\n")
//         .map((l) => l.trim())
//         .filter((l) => l.length > 0 && l.includes("-"))
//         .map((l) => {
//           const [label, amount] = l.split("-");
//           return {
//             label: label.trim(),
//             amount: Number((amount || "").trim() || 0),
//           };
//         }) || [];

//     const newWork = {
//       id: `${Date.now()}`,
//       title,
//       location,
//       src: blob.url,
//       category,
//       prices: parsedPrices,
//       alt,
//       story,
//       createdAt: new Date().toISOString(),
//     };

//     await kv.lpush("works", JSON.stringify(newWork));

//     return NextResponse.json({
//       success: true,
//       work: newWork,
//     });
//   } catch (err: any) {
//     console.error("❌ Erreur upload:", err);
//     return NextResponse.json(
//       { success: false, error: err.message || "Erreur serveur" },
//       { status: 500 }
//     );
//   }
// }
import { put } from "@vercel/blob";
import { kv } from "@/lib/kv";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier" },
        { status: 400 }
      );
    }

    const title = String(formData.get("title") || "");
    const location = String(formData.get("location") || "");
    const category = String(formData.get("category") || "");
    const prices = String(formData.get("prices") || "");
    const alt = String(formData.get("alt") || "");
    const story = String(formData.get("story") || "");

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    /* ✅ WATERMARK SVG */
    const watermarkSvg = `
      <svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
        <style>
          text { font-family: Arial, sans-serif; }
        </style>
        <text x="50%" y="50%" text-anchor="middle" fill="white"
          font-size="48" opacity="0.25" transform="rotate(-10, 400, 100)">
          MMG Images
        </text>
      </svg>
    `;
    const watermark = Buffer.from(watermarkSvg);

    /* ✅ OPTIMISATION + WATERMARK FINAL WEBP */
    const processed = await sharp(inputBuffer)
      .resize(2000, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .composite([{ input: watermark, gravity: "center" }])
      .webp({ quality: 78, effort: 5 })
      .toBuffer();

    const safeTitle = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);

    const fileName = `${Date.now()}-${safeTitle || "image"}.webp`;

    /* ✅ UPLOAD VERCEL BLOB */
    const blob = await put(fileName, processed, {
      access: "public",
      contentType: "image/webp",
    });

    const parsedPrices =
      prices
        ?.split("\n")
        .map((l) => l.trim())
        .filter((l) => l.includes("-"))
        .map((l) => {
          const [label, amount] = l.split("-");
          return {
            label: label.trim(),
            amount: Number(amount.trim()),
          };
        }) || [];

    const newWork = {
      id: Date.now().toString(),
      title,
      location,
      src: blob.url,
      category,
      prices: parsedPrices,
      alt,
      story,
      createdAt: new Date().toISOString(),
    };

    await kv.lpush("works", JSON.stringify(newWork));

    return NextResponse.json({
      success: true,
      work: newWork,
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
