// utils/convertToPNG.ts
import { decode } from "@jsquash/jxl"; // ⬅️ nouveau

// 🔍 Détection rapide du JXL via magic bytes (FF 0A / "JXL ")
export async function detectFormat(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer.slice(0, 12));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // JPEG XL signatures (cf. spec FF 0A / 00 00 00 0C 4A 58 4C …) :contentReference[oaicite:1]{index=1}
  if (hex.startsWith("ff0a") || hex.includes("4a584c")) {
    return "image/jxl";
  }

  return file.type || "unknown";
}

// 🔄 Conversion générique → PNG (en sortie, ton backend fera le WebP comme aujourd’hui)
export default async function convertToPNG(file: File): Promise<File> {
  const format = await detectFormat(file);

  let canvas: HTMLCanvasElement;

  if (format === "image/jxl") {
    // ✅ CAS JPEG XL : on décode avec @jsquash/jxl (WASM)
    const arrayBuffer = await file.arrayBuffer();
    const imageData = (await decode(arrayBuffer)) as ImageData; // decode renvoie un ImageData-like :contentReference[oaicite:2]{index=2}

    canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(imageData, 0, 0);
  } else {
    // 🌍 JPEG / PNG / WebP / HEIC lisible par le navigateur
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () =>
        reject(new Error("Impossible de charger l’image pour conversion PNG"));
    });

    canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
  }

  // 🎯 Sortie = vrai fichier PNG
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Conversion PNG échouée"));
        resolve(
          new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, ".png"),
            { type: "image/png" }
          )
        );
      },
      "image/png",
      1
    );
  });
}
