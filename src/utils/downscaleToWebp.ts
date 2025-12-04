// src/utils/downscaleToWebp.ts

export type DownscaleOptions = {
  maxSide?: number;   // ex : 2500 / 3200
  quality?: number;   // 0.85 = standard, 0.92 = Ultra HQ
};

/**
 * Réduit une image (si nécessaire) et la convertit en WebP.
 * - maxSide : côté max en pixels
 * - quality : qualité WebP (0–1)
 *
 * Visuellement, à 0.92 et 3200px, la différence est imperceptible.
 */
export async function downscaleToWebp(
  file: File,
  options: DownscaleOptions = {}
): Promise<File> {
  const { maxSide = 2500, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        let { width, height } = img;
        const max = Math.max(width, height);

        // On ne réduit que si c'est nécessaire
        if (max > maxSide) {
          const ratio = maxSide / max;
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Canvas KO");
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              reject(new Error("Optimisation KO (blob vide)"));
              return;
            }

            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              { type: "image/webp" }
            );

            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de charger l'image pour optimisation."));
    };

    img.src = url;
  });
}
