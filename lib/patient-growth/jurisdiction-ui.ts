/**
 * Single source for public jurisdiction labels.
 * Country and subdivision values stay ISO. Names come from Intl when reliable.
 */

const ADMIN_LEVEL_BY_COUNTRY: Record<string, string> = {
  CL: "Región",
  CO: "Departamento",
  US: "Estado",
  MX: "Estado",
  BR: "Estado",
  AR: "Provincia",
};

const ADMIN_LEVEL_FALLBACK = "División administrativa";
const ISO_3166_2 = /^[A-Z]{2}-[A-Z0-9]{1,3}$/;

export type JurisdictionOption = {
  countryCode: string;
  subdivisions: readonly string[];
};

export function adminLevelLabel(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  return ADMIN_LEVEL_BY_COUNTRY[code] ?? ADMIN_LEVEL_FALLBACK;
}

export function countryDisplayName(countryCode: string, locale = "es"): string {
  const code = countryCode.trim().toUpperCase();
  return regionDisplayName(code, locale) ?? code;
}

/**
 * Human name only when Intl resolves a real region name.
 * Otherwise the ISO-3166-2 code is the display.
 */
export function subdivisionDisplayName(code: string, locale = "es"): string {
  const normalized = code.trim().toUpperCase();
  const name = regionDisplayName(normalized, locale);
  if (!name || name.toUpperCase() === normalized || ISO_3166_2.test(name)) {
    return normalized;
  }
  return name;
}

export function countryOptions(
  jurisdictions: readonly JurisdictionOption[],
  locale = "es",
): { value: string; label: string }[] {
  return jurisdictions.map((row) => ({
    value: row.countryCode,
    label: countryDisplayName(row.countryCode, locale),
  }));
}

export function subdivisionOptionsForCountry(
  jurisdictions: readonly JurisdictionOption[],
  countryCode: string,
): string[] {
  const code = countryCode.trim().toUpperCase();
  return (
    jurisdictions.find((row) => row.countryCode === code)?.subdivisions.slice() ??
    []
  );
}

export function isNationalCoverage(subdivisions: readonly string[]): boolean {
  return subdivisions.length === 0;
}

export function subdivisionAfterCountryChange(
  currentSubdivision: string,
  allowedSubdivisions: readonly string[],
): string {
  const current = currentSubdivision.trim().toUpperCase();
  return allowedSubdivisions.includes(current) ? current : "";
}

export function buildMedicosQuery(input: {
  q?: string;
  specialty?: string;
  patientCountry?: string;
  patientSubdivision?: string;
}): string {
  const params = new URLSearchParams();
  const q = input.q?.trim();
  const specialty = input.specialty?.trim();
  const country = input.patientCountry?.trim().toUpperCase();
  const subdivision = input.patientSubdivision?.trim().toUpperCase();
  if (q) params.set("q", q);
  if (specialty) params.set("specialty", specialty);
  if (country && /^[A-Z]{2}$/.test(country)) {
    params.set("patientCountry", country);
  }
  if (subdivision && ISO_3166_2.test(subdivision)) {
    params.set("patientSubdivision", subdivision);
  }
  const encoded = params.toString();
  return encoded ? `/medicos?${encoded}` : "/medicos";
}

function regionDisplayName(code: string, locale: string): string | null {
  if (!code) return null;
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? null;
  } catch {
    return null;
  }
}
