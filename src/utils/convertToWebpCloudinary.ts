// src/utils/convertToWebpCloudinary.ts

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.CLOUDINARY_UPLOAD_PRESET || "mmg-images";

/**
 * Envoie un ArrayBuffer brut vers Cloudinary
 * et renvoie l'image convertie en WebP sous forme d'ArrayBuffer.
 */
export async function convertToWebpWithCloudinary(
  inputBuffer: ArrayBuffer
): Promise<ArrayBuffer> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME manquant dans .env");
  }

  // ⚠️ IMPORTANT : ne pas importer "form-data"
  const form = new FormData();

  // On transforme l'ArrayBuffer en Blob pour l'ajouter au FormData
  const blob = new Blob([inputBuffer], {
    type: "application/octet-stream",
  });

  form.append("file", blob, "upload");
  form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  // 1️⃣ Upload brut vers Cloudinary
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  const uploadJson = await uploadRes.json();
  
  if (!uploadRes.ok || !uploadJson.public_id) {
    console.error("Cloudinary upload error:", uploadJson);
    throw new Error(
      uploadJson.error?.message || "Erreur Cloudinary lors de l'upload"
    );
  }

  const publicId: string = uploadJson.public_id;

  // 2️⃣ URL de transformation → WebP
  const webpUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_webp,q_auto/${publicId}`;

  const webpRes = await fetch(webpUrl);

  if (!webpRes.ok) {
    throw new Error("Erreur récupération WebP depuis Cloudinary");
  }

  // ✅ On renvoie un ArrayBuffer propre
  const webpArrayBuffer = await webpRes.arrayBuffer();
  return webpArrayBuffer;
}
