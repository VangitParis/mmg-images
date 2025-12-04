export async function optimizeIfTooLarge(
  file: File,
  maxBytes = 4 * 1024 * 1024 // 4 Mo
): Promise<File> {
  if (file.size <= maxBytes) return file;

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  await new Promise((res) => (img.onload = res));

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext("2d")!.drawImage(img, 0, 0);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b!),
      "image/webp",
      0.92 // ✅ compression invisible
    )
  );

  return new File(
    [blob],
    file.name.replace(/\.[^/.]+$/, ".webp"),
    { type: "image/webp" }
  );
}
