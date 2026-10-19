import type { LocalizedLabel } from "./types";

export interface CountryOption {
  code: string;
  name: LocalizedLabel;
}

/**
 * ISO-3166-1 alpha-2 country list — single source for nationality AND residence pickers.
 * Do not duplicate country arrays in UI components.
 */
export const COUNTRY_OPTIONS: readonly CountryOption[] = [
  { code: "CL", name: { es: "Chile", en: "Chile" } },
  { code: "AR", name: { es: "Argentina", en: "Argentina" } },
  { code: "BO", name: { es: "Bolivia", en: "Bolivia" } },
  { code: "BR", name: { es: "Brasil", en: "Brazil" } },
  { code: "CO", name: { es: "Colombia", en: "Colombia" } },
  { code: "CR", name: { es: "Costa Rica", en: "Costa Rica" } },
  { code: "CU", name: { es: "Cuba", en: "Cuba" } },
  { code: "DO", name: { es: "República Dominicana", en: "Dominican Republic" } },
  { code: "EC", name: { es: "Ecuador", en: "Ecuador" } },
  { code: "SV", name: { es: "El Salvador", en: "El Salvador" } },
  { code: "GT", name: { es: "Guatemala", en: "Guatemala" } },
  { code: "HN", name: { es: "Honduras", en: "Honduras" } },
  { code: "MX", name: { es: "México", en: "Mexico" } },
  { code: "NI", name: { es: "Nicaragua", en: "Nicaragua" } },
  { code: "PA", name: { es: "Panamá", en: "Panama" } },
  { code: "PY", name: { es: "Paraguay", en: "Paraguay" } },
  { code: "PE", name: { es: "Perú", en: "Peru" } },
  { code: "UY", name: { es: "Uruguay", en: "Uruguay" } },
  { code: "VE", name: { es: "Venezuela", en: "Venezuela" } },
  { code: "US", name: { es: "Estados Unidos", en: "United States" } },
  { code: "CA", name: { es: "Canadá", en: "Canada" } },
  { code: "ES", name: { es: "España", en: "Spain" } },
  { code: "PT", name: { es: "Portugal", en: "Portugal" } },
  { code: "FR", name: { es: "Francia", en: "France" } },
  { code: "DE", name: { es: "Alemania", en: "Germany" } },
  { code: "IT", name: { es: "Italia", en: "Italy" } },
  { code: "GB", name: { es: "Reino Unido", en: "United Kingdom" } },
  { code: "IE", name: { es: "Irlanda", en: "Ireland" } },
  { code: "NL", name: { es: "Países Bajos", en: "Netherlands" } },
  { code: "BE", name: { es: "Bélgica", en: "Belgium" } },
  { code: "CH", name: { es: "Suiza", en: "Switzerland" } },
  { code: "AT", name: { es: "Austria", en: "Austria" } },
  { code: "SE", name: { es: "Suecia", en: "Sweden" } },
  { code: "NO", name: { es: "Noruega", en: "Norway" } },
  { code: "DK", name: { es: "Dinamarca", en: "Denmark" } },
  { code: "FI", name: { es: "Finlandia", en: "Finland" } },
  { code: "PL", name: { es: "Polonia", en: "Poland" } },
  { code: "AU", name: { es: "Australia", en: "Australia" } },
  { code: "NZ", name: { es: "Nueva Zelanda", en: "New Zealand" } },
  { code: "JP", name: { es: "Japón", en: "Japan" } },
  { code: "KR", name: { es: "Corea del Sur", en: "South Korea" } },
  { code: "CN", name: { es: "China", en: "China" } },
  { code: "IN", name: { es: "India", en: "India" } },
  { code: "PH", name: { es: "Filipinas", en: "Philippines" } },
  { code: "ZA", name: { es: "Sudáfrica", en: "South Africa" } },
  { code: "EG", name: { es: "Egipto", en: "Egypt" } },
  { code: "IL", name: { es: "Israel", en: "Israel" } },
  { code: "AE", name: { es: "Emiratos Árabes Unidos", en: "United Arab Emirates" } },
  { code: "OTHER", name: { es: "Otro / no listado", en: "Other / not listed" } },
] as const;

const BY_CODE = new Map(COUNTRY_OPTIONS.map((c) => [c.code, c]));

export function normalizeCountryCode(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  const code = raw.trim().toUpperCase();
  if (code === "OTHER") return "OTHER";
  return /^[A-Z]{2}$/.test(code) ? code : "";
}

export function getCountryLabel(
  code: string | null | undefined,
  locale: "es" | "en" = "es",
): string {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return "";
  const hit = BY_CODE.get(normalized);
  if (hit) return hit.name[locale];
  return normalized;
}

export function listCountriesForSelect(locale: "es" | "en" = "es"): {
  value: string;
  label: string;
}[] {
  return COUNTRY_OPTIONS.map((c) => ({
    value: c.code,
    label: c.name[locale],
  }));
}
