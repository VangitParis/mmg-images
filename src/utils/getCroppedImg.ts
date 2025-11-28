export default async function getCroppedImg(
  imageSrc: string,
  crop: any,
  targetWidth: number = 2000
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  const ratio = targetWidth / cropWidth;
  canvas.width = targetWidth;
  canvas.height = cropHeight * ratio;

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // 🔥 1er essai : WEBP
  let blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.85)
  );

  // ❗ Si le blob est vide (cas fréquent sur mobile) → PNG de secours
  if (!blob || blob.size === 0) {
    blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png", 1)
    );
  }

  return blob!;
}



function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}
