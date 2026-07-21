/**
 * Global Address Engine — shared types (SSOT).
 * Nationality and country of residence are independent concepts.
 */

export type LocaleCode = "es" | "en";

export type AdminLevelKey = "admin1" | "admin2" | "admin3" | "admin4";

export type LocalizedLabel = Record<LocaleCode, string>;

export interface CatalogNode {
  code: string;
  name: string;
  children?: CatalogNode[];
}

export interface AdminLevelDefinition {
  key: AdminLevelKey;
  /** Adaptive UI labels by locale (e.g. Región / State / Departamento). */
  label: LocalizedLabel;
  /** When true, UI must use select from catalog options. */
  hasCatalog: boolean;
}

export interface CountryAddressProfile {
  countryCode: string;
  name: LocalizedLabel;
  levels: AdminLevelDefinition[];
}

export interface AddressSelection {
  /** ISO-3166-1 alpha-2 — country of residence (master field). */
  countryCode: string;
  admin1Code?: string;
  admin1Name?: string;
  admin2Code?: string;
  admin2Name?: string;
  admin3Code?: string;
  admin3Name?: string;
  admin4Code?: string;
  admin4Name?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  /** Free-text fallback when a level has no catalog. */
  freeText?: Partial<Record<AdminLevelKey, string>>;
}

/** Flat patient/API persistence shape (backward compatible). */
export interface PatientAddressFields {
  country?: string;
  stateProvince?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
}

export interface NationalitySelection {
  /** ISO-3166-1 alpha-2 — independent from residence. */
  nationalityCode: string;
}

export interface CatalogOption {
  code: string;
  name: string;
}

export interface LevelFieldState {
  key: AdminLevelKey;
  label: string;
  mode: "select" | "text";
  options: CatalogOption[];
  valueCode: string;
  valueName: string;
  disabled: boolean;
}
