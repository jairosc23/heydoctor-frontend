export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://heydoctor-backend-pro-production.up.railway.app/api";

export function getApiBase(): string {
  return API_URL.replace(/\/$/, "");
}
