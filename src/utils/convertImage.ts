// utils/convertImage.ts

// 🔍 Détection du format par magic bytes
export async function detectFormat(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);
      
      // JPEG: FF D8 FF
      if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) {
        resolve('jpeg');
      }
      // PNG: 89 50 4E 47
      else if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
        resolve('png');
      }
      // WebP: RIFF ... WEBP
      else if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
               arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50) {
        resolve('webp');
      }
      // JXL: FF 0A (simple) ou 00 00 00 0C 4A 58 4C 20 (container)
      else if ((arr[0] === 0xFF && arr[1] === 0x0A) || 
               (arr[0] === 0x00 && arr[1] === 0x00 && arr[2] === 0x00 && arr[3] === 0x0C &&
                arr[4] === 0x4A && arr[5] === 0x58 && arr[6] === 0x4C && arr[7] === 0x20)) {
        resolve('jxl');
      }
      // HEIC/HEIF: ftyp
      else if (arr[4] === 0x66 && arr[5] === 0x74 && arr[6] === 0x79 && arr[7] === 0x70) {
        resolve('heic');
      }
      else {
        resolve('unknown');
      }
    };
    
    reader.onerror = () => resolve('unknown');
    reader.readAsArrayBuffer(file.slice(0, 12));
  });
}

// 🔄 Conversion JXL → PNG avec jSquash
export async function convertJXLtoPNG(file: File): Promise<File> {
  try {
    console.log('🔄 Début conversion JXL → PNG...');
    
    // Import dynamique de jSquash
    const { decode: decodeJXL } = await import('@jsquash/jxl');
    const { encode: encodePNG } = await import('@jsquash/png');
    
    // Lire le fichier JXL en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    console.log(`📸 Décodage JXL (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)...`);
    
    // Décoder JXL vers ImageData (on passe directement l'ArrayBuffer)
    const imageData = await decodeJXL(arrayBuffer);
    console.log(`📐 Dimensions : ${imageData.width}x${imageData.height}px`);
    
    // Encoder en PNG
    console.log('🎨 Encodage PNG...');
    const pngBuffer = await encodePNG(imageData);
    
    // Créer un nouveau fichier PNG
    const pngFile = new File(
      [pngBuffer],
      file.name.replace(/\.jxl$/i, '.png'),
      { type: 'image/png' }
    );
    
    console.log(`✅ Conversion terminée : ${(pngFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    return pngFile;
    
  } catch (err: any) {
    console.error('❌ Erreur détaillée:', err);
    throw new Error(`Conversion JXL échouée: ${err.message}`);
  }
}