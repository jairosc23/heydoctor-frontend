import chileCatalog from "../catalogs/chile.json";
import colombiaCatalog from "../catalogs/colombia.json";
import argentinaCatalog from "../catalogs/argentina.json";
import usCatalog from "../catalogs/united-states.json";
import type { CountryCatalogFile } from "../catalogs/types";
import { normalizeCountryCode } from "../countries";
import { createCatalogAdapter } from "./catalog-adapter";
import { createGenericAdapter } from "./generic";
import type { CountryAddressAdapter } from "./types";

const chile = createCatalogAdapter(chileCatalog as CountryCatalogFile, {
  es: "Chile",
  en: "Chile",
});

const colombia = createCatalogAdapter(colombiaCatalog as CountryCatalogFile, {
  es: "Colombia",
  en: "Colombia",
});

const argentina = createCatalogAdapter(argentinaCatalog as CountryCatalogFile, {
  es: "Argentina",
  en: "Argentina",
});

const unitedStates = createCatalogAdapter(usCatalog as CountryCatalogFile, {
  es: "Estados Unidos",
  en: "United States",
});

const SPECIALIZED: Record<string, CountryAddressAdapter> = {
  CL: chile,
  CO: colombia,
  AR: argentina,
  US: unitedStates,
};

const genericCache = new Map<string, CountryAddressAdapter>();

export function getAddressAdapter(
  countryCode: string | null | undefined,
): CountryAddressAdapter {
  const code = normalizeCountryCode(countryCode) || "CL";
  if (SPECIALIZED[code]) return SPECIALIZED[code];

  let cached = genericCache.get(code);
  if (!cached) {
    cached = createGenericAdapter(code);
    genericCache.set(code, cached);
  }
  return cached;
}

export function listSpecializedCountryCodes(): string[] {
  return Object.keys(SPECIALIZED);
}
