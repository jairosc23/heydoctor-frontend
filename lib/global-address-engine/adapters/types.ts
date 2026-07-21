import type {
  AddressSelection,
  AdminLevelKey,
  CatalogOption,
  CountryAddressProfile,
  LocaleCode,
} from "../types";

export interface CountryAddressAdapter {
  countryCode: string;
  getProfile(locale?: LocaleCode): CountryAddressProfile;
  /** Options for a level given current cascade selection. */
  getOptions(
    level: AdminLevelKey,
    selection: Pick<
      AddressSelection,
      "admin1Code" | "admin2Code" | "admin3Code"
    >,
  ): CatalogOption[];
  /** Resolve display name for a stored code (or return code/name as-is). */
  resolveName(
    level: AdminLevelKey,
    code: string,
    selection: Pick<
      AddressSelection,
      "admin1Code" | "admin2Code" | "admin3Code"
    >,
  ): string;
}
