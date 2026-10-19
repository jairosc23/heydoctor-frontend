import type {
  AdminLevelKey,
  CatalogOption,
  CountryAddressProfile,
  LocaleCode,
} from "../types";
import { getCountryLabel } from "../countries";
import type { CountryAddressAdapter } from "./types";

/** Default adapter: adaptive labels + free-text admin levels (no catalog). */
export function createGenericAdapter(countryCode: string): CountryAddressAdapter {
  return {
    countryCode,

    getProfile(locale: LocaleCode = "es"): CountryAddressProfile {
      return {
        countryCode,
        name: {
          es: getCountryLabel(countryCode, "es") || countryCode,
          en: getCountryLabel(countryCode, "en") || countryCode,
        },
        levels: [
          {
            key: "admin1",
            label: {
              es: "Región / Estado / Provincia",
              en: "Region / State / Province",
            },
            hasCatalog: false,
          },
          {
            key: "admin2",
            label: { es: "Ciudad / Municipio", en: "City / Municipality" },
            hasCatalog: false,
          },
        ],
      };
    },

    getOptions(_level: AdminLevelKey): CatalogOption[] {
      return [];
    },

    resolveName(_level, code): string {
      return code;
    },
  };
}
