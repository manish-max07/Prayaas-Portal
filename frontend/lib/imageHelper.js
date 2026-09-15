/**
 * Helper to detect if a string represents an image URL
 * Handles Digialm CDN image links, standard web images, and base64 data URLs
 */
export function isImageUrl(str) {
  if (!str || typeof str !== "string") return false;
  const s = str.trim();

  // Data URLs
  if (s.startsWith("data:image/")) return true;

  // Must be HTTP/HTTPS
  if (!s.startsWith("http://") && !s.startsWith("https://")) return false;

  // Standard image file extensions with optional query parameters (e.g. .png?0.023...)
  if (/\.(png|jpe?g|gif|webp|svg|bmp|ico|tiff)(\?.*)?$/i.test(s)) return true;

  // Digialm response sheet image storage paths
  if (/\/(adcimages|TempQPImagesStoreMode|touchstone.*adcimages)\//i.test(s)) return true;

  return false;
}
