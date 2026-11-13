/**
 * Utility to optimize slide images before sending them to the Vision AI API.
 * 
 * High-resolution design exports (e.g. 2500x2500px, 8MB) exceed serverless
 * payload limits (Vercel limit is 4.5MB) and increase API latency.
 * 
 * This function scales down images to a sensible maximum (e.g. 1400px) and
 * converts them to optimized JPEG format (~150-250KB), which preserves 100%
 * of text clarity for Gemini while guaranteeing fast, error-free uploads.
 */

export async function compressImageForAnalysis(
  dataUrl: string,
  maxDimension = 1400,
  quality = 0.88
): Promise<string> {
  // If not a data URL or in SSR, return as-is
  if (typeof window === 'undefined' || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // If already within bounds, we still compress to JPEG to reduce base64 size
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Draw white background in case of transparent PNGs
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Output as optimized JPEG
      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (e) {
        console.warn('Image compression fallback:', e);
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
