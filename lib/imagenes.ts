// Compresión de imágenes del lado del cliente antes de guardarlas como data
// URL (patrón usado en toda la app: logos, fotos de personal, evidencias,
// etc.). Redimensiona al máximo indicado y recomprime a JPEG, así una foto
// de cámara de 4-8MB queda en unos pocos cientos de KB sin que el usuario
// tenga que achicarla a mano.

export function comprimirImagen(file: File, maxDimension = 700, calidad = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }
        // Fondo blanco antes de dibujar: evita que un PNG con transparencia
        // (ej. un logo) quede con fondo negro al exportar como JPEG.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", calidad));
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = lector.result as string;
    };
    lector.onerror = () => reject(new Error("No se pudo leer el archivo."));
    lector.readAsDataURL(file);
  });
}
