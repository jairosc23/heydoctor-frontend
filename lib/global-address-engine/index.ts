export type {
  AddressSelection,
  AdminLevelKey,
  CatalogOption,
  CountryAddressProfile,
  LevelFieldState,
  LocaleCode,
  NationalitySelection,
  PatientAddressFields,
} from "./types";

export {
  COUNTRY_OPTIONS,
  getCountryLabel,
  listCountriesForSelect,
  normalizeCountryCode,
} from "./countries";

export {
  computeAgeFromBirthDate,
  formatComputedAge,
  resolveAgeDisplay,
} from "./age";

export {
  applyAddressChange,
  buildLevelFieldStates,
  createEmptyAddressSelection,
  getCountryAddressProfile,
} from "./engine";

export {
  addressSelectionToPatientFields,
  patientFieldsToAddressSelection,
} from "./map-to-patient-fields";

export { getAddressAdapter, listSpecializedCountryCodes } from "./adapters/registry";
