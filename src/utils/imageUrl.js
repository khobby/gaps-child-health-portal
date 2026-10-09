const API_URL = import.meta.env.VITE_API_URL;

export function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (!API_URL) {
    console.error("VITE_API_URL is required to display uploaded images.");
    return imageUrl;
  }

  return new URL(imageUrl, `${API_URL.replace(/\/+$/, "")}/`).toString();
}
