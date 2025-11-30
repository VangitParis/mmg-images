///src/utils/convertToPNG.ts
"use client";

/**
 * Détecte le format d'une image en lisant ses premiers octets (magic bytes)
 */
export async function detectFormat(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);
      
      // JPEG: FF D8 FF
      if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
        resolve("image/jpeg");
      }
      // PNG: 89 50 4E 47
      else if (
        arr[0] === 0x89 &&
        arr[1] === 0x50 &&
        arr[2] === 0x4E &&
        arr[3] === 0x47
      ) {
        resolve("image/png");
      }
      // WebP: RIFF....WEBP
      else if (
        arr[0] === 0x52 &&
        arr[1] === 0x49 &&
        arr[2] === 0x46 &&
        arr[3] === 0x46 &&
        arr[8] === 0x57 &&
        arr[9] === 0x45 &&
        arr[10] === 0x42 &&
        arr[11] === 0x50
      ) {
        resolve("image/webp");
      }
      // JXL: FF 0A ou header conteneur
      else if (
        (arr[0] === 0xFF && arr[1] === 0x0A) ||
        (arr[0] === 0x00 &&
          arr[1] === 0x00 &&
          arr[2] === 0x00 &&
          arr[3] === 0x0C &&
          arr[4] === 0x4A &&
          arr[5] === 0x58 &&
          arr[6] === 0x4C &&
          arr[7] === 0x20)
      ) {
        resolve("image/jxl");
      }
      // GIF: 47 49 46
      else if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46) {
        resolve("image/gif");
      }
      // HEIC/HEIF: ftyp...
      else if (
        arr[4] === 0x66 &&
        arr[5] === 0x74 &&
        arr[6] === 0x79 &&
        arr[7] === 0x70
      ) {
        resolve("image/heic");
      } else {
        resolve("unknown");
      }
    };
    
    reader.onerror = () => resolve("unknown");
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
}

/**
 * Convertit une image (lisible par le navigateur) en PNG via Canvas
 */
export default async function convertToPNG(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Impossible de créer le contexte canvas");
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error("Échec de la conversion en PNG"));
              return;
            }
            
            const pngFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".png"),
              { type: "image/png" }
            );
            
            resolve(pngFile);
          },
          "image/png",
          1.0
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          "Impossible de charger l'image. Format non supporté par le navigateur."
        )
      );
    };
    
    img.src = url;
  });
}

/**
 * Validation simple d'un fichier image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
  ];
  
  if (validTypes.includes(file.type)) {
    return true;
  }
  
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif", "jxl"].includes(
    ext || ""
  );
}

