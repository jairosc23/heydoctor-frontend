/**
 * Base del backend con sufijo `/api` (prefijo global de Nest).
 * Acepta `NEXT_PUBLIC_API_URL` como solo origen (`https://host`) o ya con `/api`.
 */
function normalizeApiBaseUrl(input: string): string {
  const trimmed = input.replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) {
    return trimmed;
  }
  return `${trimmed}/api`;
}

export const API_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001",
);

export function getApiBase(): string {
  return API_URL;
}
