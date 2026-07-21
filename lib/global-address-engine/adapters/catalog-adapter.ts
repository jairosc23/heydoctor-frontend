import type { CountryCatalogFile } from "../catalogs/types";
import type {
  AddressSelection,
  AdminLevelKey,
  CatalogOption,
  CountryAddressProfile,
  LocaleCode,
} from "../types";
import type { CountryAddressAdapter } from "./types";

function levelHasChildren(
  catalog: CountryCatalogFile,
  level: AdminLevelKey,
): boolean {
  if (level === "admin1") return catalog.admin1.length > 0;
  if (level === "admin2") {
    return catalog.admin1.some((a) => (a.admin2?.length ?? 0) > 0);
  }
  if (level === "admin3") {
    return catalog.admin1.some((a) =>
      (a.admin2 ?? []).some((b) => (b.admin3?.length ?? 0) > 0),
    );
  }
  if (level === "admin4") {
    return catalog.admin1.some((a) =>
      (a.admin2 ?? []).some((b) =>
        (b.admin3 ?? []).some((c) => (c.admin4?.length ?? 0) > 0),
      ),
    );
  }
  return false;
}

export function createCatalogAdapter(
  catalog: CountryCatalogFile,
  countryName: { es: string; en: string },
): CountryAddressAdapter {
  const countryCode = catalog.countryCode;

  return {
    countryCode,

    getProfile(locale: LocaleCode = "es"): CountryAddressProfile {
      void locale;
      return {
        countryCode,
        name: countryName,
        levels: catalog.levels.map((level) => ({
          key: level.key,
          label: level.label,
          hasCatalog: levelHasChildren(catalog, level.key),
        })),
      };
    },

    getOptions(level, selection): CatalogOption[] {
      if (level === "admin1") {
        return catalog.admin1.map((n) => ({ code: n.code, name: n.name }));
      }

      if (level === "admin2") {
        const parent = catalog.admin1.find(
          (n) => n.code === selection.admin1Code,
        );
        return (parent?.admin2 ?? []).map((n) => ({
          code: n.code,
          name: n.name,
        }));
      }

      if (level === "admin3") {
        const a1 = catalog.admin1.find((n) => n.code === selection.admin1Code);
        const a2 = a1?.admin2?.find((n) => n.code === selection.admin2Code);
        return (a2?.admin3 ?? []).map((n) => ({ code: n.code, name: n.name }));
      }

      if (level === "admin4") {
        const a1 = catalog.admin1.find((n) => n.code === selection.admin1Code);
        const a2 = a1?.admin2?.find((n) => n.code === selection.admin2Code);
        const a3 = a2?.admin3?.find((n) => n.code === selection.admin3Code);
        return (a3?.admin4 ?? []).map((n) => ({ code: n.code, name: n.name }));
      }

      return [];
    },

    resolveName(level, code, selection): string {
      const options = this.getOptions(level, selection);
      return options.find((o) => o.code === code)?.name ?? code;
    },
  };
}

export function emptySelectionForCountry(
  countryCode: string,
): AddressSelection {
  return {
    countryCode,
    admin1Code: "",
    admin1Name: "",
    admin2Code: "",
    admin2Name: "",
    admin3Code: "",
    admin3Name: "",
    admin4Code: "",
    admin4Name: "",
    freeText: {},
  };
}
