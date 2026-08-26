// Centralized API client utility for KrushiMitra frontend

const rawUrl = import.meta.env.VITE_API_BASE_URL || "https://greenthumb-ai-1.onrender.com";
export const API_BASE_URL = String(rawUrl).replace(/[\)\s]/g, "").replace(/\/+$/, "");

/**
 * Construct a clean endpoint URL without broken double slashes or syntax artifacts.
 * @param path Endpoint path, e.g. "/api/health" or "health"
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Fetch wrapper for API calls hitting live backend routes.
 */
export async function fetchApi(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, options);
}
