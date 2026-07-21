import { getAddressAdapter } from "./adapters/registry";
import { normalizeCountryCode } from "./countries";
import { createEmptyAddressSelection } from "./engine";
import type { AddressSelection, PatientAddressFields } from "./types";

function firstNonEmpty(...values: (string | undefined | null)[]): string {
  for (const v of values) {
    if (v?.trim()) return v.trim();
  }
  return "";
}

/**
 * Map engine selection → existing patient persistence fields (backward compatible).
 * - country: ISO-2 residence
 * - stateProvince: top admin level display name
 * - city: deepest populated locality name (comuna / municipio / city)
 */
export function addressSelectionToPatientFields(
  selection: AddressSelection,
): PatientAddressFields {
  const country = normalizeCountryCode(selection.countryCode) || undefined;

  const stateProvince = firstNonEmpty(
    selection.admin1Name,
    selection.freeText?.admin1,
    selection.admin1Code,
  );

  const city = firstNonEmpty(
    selection.admin3Name,
    selection.freeText?.admin3,
    selection.admin2Name,
    selection.freeText?.admin2,
    selection.admin4Name,
    selection.freeText?.admin4,
  );

  return {
    country,
    stateProvince: stateProvince || undefined,
    city: city || undefined,
    addressLine1: selection.addressLine1?.trim() || undefined,
    addressLine2: selection.addressLine2?.trim() || undefined,
    postalCode: selection.postalCode?.trim() || undefined,
  };
}

/**
 * Hydrate engine selection from legacy patient fields.
 * Best-effort: matches catalog codes/names when possible; otherwise free-text.
 */
export function patientFieldsToAddressSelection(
  fields: PatientAddressFields,
  fallbackCountry = "CL",
): AddressSelection {
  const countryCode =
    normalizeCountryCode(fields.country) ||
    normalizeCountryCode(fallbackCountry) ||
    "CL";

  const base = createEmptyAddressSelection(countryCode);
  base.addressLine1 = fields.addressLine1 ?? "";
  base.addressLine2 = fields.addressLine2 ?? "";
  base.postalCode = fields.postalCode ?? "";

  const adapter = getAddressAdapter(countryCode);
  const profile = adapter.getProfile();
  const state = fields.stateProvince?.trim() ?? "";
  const city = fields.city?.trim() ?? "";

  if (state) {
    const admin1Def = profile.levels.find((l) => l.key === "admin1");
    if (admin1Def?.hasCatalog) {
      const options = adapter.getOptions("admin1", base);
      const byCode = options.find(
        (o) => o.code.toUpperCase() === state.toUpperCase(),
      );
      const byName = options.find(
        (o) => o.name.toLowerCase() === state.toLowerCase(),
      );
      const hit = byCode ?? byName;
      if (hit) {
        base.admin1Code = hit.code;
        base.admin1Name = hit.name;
      } else {
        base.freeText = { ...(base.freeText ?? {}), admin1: state };
        base.admin1Name = state;
      }
    } else {
      base.freeText = { ...(base.freeText ?? {}), admin1: state };
      base.admin1Name = state;
    }
  }

  if (city) {
    const hasAdmin3 = profile.levels.some(
      (l) => l.key === "admin3" && l.hasCatalog,
    );
    const hasAdmin2Catalog = profile.levels.some(
      (l) => l.key === "admin2" && l.hasCatalog,
    );

    if (hasAdmin3 && base.admin1Code) {
      // Chile-style: city ≈ comuna; try match under all provinces of region.
      const provinces = adapter.getOptions("admin2", base);
      for (const province of provinces) {
        const probe = { ...base, admin2Code: province.code };
        const communes = adapter.getOptions("admin3", probe);
        const hit = communes.find(
          (c) =>
            c.name.toLowerCase() === city.toLowerCase() ||
            c.code === city,
        );
        if (hit) {
          base.admin2Code = province.code;
          base.admin2Name = province.name;
          base.admin3Code = hit.code;
          base.admin3Name = hit.name;
          return base;
        }
      }
      // Region known but comuna not matched — store as free-text admin3.
      base.freeText = { ...(base.freeText ?? {}), admin3: city };
      base.admin3Name = city;
      return base;
    }

    if (hasAdmin2Catalog && base.admin1Code) {
      const options = adapter.getOptions("admin2", base);
      const hit = options.find(
        (o) =>
          o.name.toLowerCase() === city.toLowerCase() || o.code === city,
      );
      if (hit) {
        base.admin2Code = hit.code;
        base.admin2Name = hit.name;
        return base;
      }
    }

    // Generic / partial catalogs: city → free-text admin2 (or admin3 if profile has it).
    const target = profile.levels.some((l) => l.key === "admin3")
      ? "admin3"
      : "admin2";
    base.freeText = { ...(base.freeText ?? {}), [target]: city };
    if (target === "admin3") base.admin3Name = city;
    else base.admin2Name = city;
  }

  return base;
}
