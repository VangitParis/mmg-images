export async function preCompressForSafari(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size < 4 * 1024 * 1024) return file;

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);

  await new Promise((res) => (img.onload = res));

  const canvas = document.createElement("canvas");
  const max = 1800;
  const ratio = Math.min(max / img.width, max / img.height, 1);

  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/webp", 0.82)
  );

  return new File([blob], file.name.replace(/\..+$/, ".webp"), {
    type: "image/webp",
  });
}
