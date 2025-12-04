export type DownscaleOptions = {
  maxSide?: number;   // ex: 2500 / 3200
  quality?: number;  // 0.85 = standard, 0.92 = Ultra HQ
};

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

        if (max > maxSide) {
          const ratio = maxSide / max;
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas KO");

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error("Optimisation KO"));

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
      reject(new Error("Chargement image impossible"));
    };

    img.src = url;
  });
}
