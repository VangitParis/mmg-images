// 🔍 Détection du format réel via les premiers octets du fichier
export async function detectFormat(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer.slice(0, 12));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // JPEG XL : signatures fréquentes
  if (hex.startsWith("ff0a") || hex.includes("4a584c")) {
    return "image/jxl";
  }

  // HEIC / HEIF (iPhone)
  if (hex.includes("6674797068656963") || hex.includes("667479706d7036")) {
    return "image/heic";
  }

  // Sinon on renvoie le type fourni par le navigateur
  return file.type || "unknown";
}

// 🔄 Conversion vers PNG (pour HEIC / formats exotiques mais décodables)
export default async function convertToPNG(file: File): Promise<File> {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Impossible de charger l’image"));
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("Conversion PNG échouée"));
      resolve(
        new File(
          [blob],
          file.name.replace(/\.[^/.]+$/, ".png"),
          { type: "image/png" }
        )
      );
    }, "image/png");
  });
}
