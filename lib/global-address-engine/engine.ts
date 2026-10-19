import { emptySelectionForCountry } from "./adapters/catalog-adapter";
import { getAddressAdapter } from "./adapters/registry";
import { normalizeCountryCode } from "./countries";
import type {
  AddressSelection,
  AdminLevelKey,
  CountryAddressProfile,
  LevelFieldState,
  LocaleCode,
} from "./types";

const LEVEL_ORDER: AdminLevelKey[] = [
  "admin1",
  "admin2",
  "admin3",
  "admin4",
];

function getLevelCode(
  selection: AddressSelection,
  level: AdminLevelKey,
): string {
  switch (level) {
    case "admin1":
      return selection.admin1Code ?? "";
    case "admin2":
      return selection.admin2Code ?? "";
    case "admin3":
      return selection.admin3Code ?? "";
    case "admin4":
      return selection.admin4Code ?? "";
  }
}

function getLevelName(
  selection: AddressSelection,
  level: AdminLevelKey,
): string {
  switch (level) {
    case "admin1":
      return selection.admin1Name ?? "";
    case "admin2":
      return selection.admin2Name ?? "";
    case "admin3":
      return selection.admin3Name ?? "";
    case "admin4":
      return selection.admin4Name ?? "";
  }
}

function clearLevel(selection: AddressSelection, level: AdminLevelKey): void {
  switch (level) {
    case "admin1":
      selection.admin1Code = "";
      selection.admin1Name = "";
      break;
    case "admin2":
      selection.admin2Code = "";
      selection.admin2Name = "";
      break;
    case "admin3":
      selection.admin3Code = "";
      selection.admin3Name = "";
      break;
    case "admin4":
      selection.admin4Code = "";
      selection.admin4Name = "";
      break;
  }
  if (selection.freeText) delete selection.freeText[level];
}

function setLevel(
  selection: AddressSelection,
  level: AdminLevelKey,
  code: string,
  name: string,
): void {
  switch (level) {
    case "admin1":
      selection.admin1Code = code;
      selection.admin1Name = name;
      break;
    case "admin2":
      selection.admin2Code = code;
      selection.admin2Name = name;
      break;
    case "admin3":
      selection.admin3Code = code;
      selection.admin3Name = name;
      break;
    case "admin4":
      selection.admin4Code = code;
      selection.admin4Name = name;
      break;
  }
}

export function getCountryAddressProfile(
  countryCode: string | null | undefined,
  locale: LocaleCode = "es",
): CountryAddressProfile {
  return getAddressAdapter(countryCode).getProfile(locale);
}

/** Build UI field states for the current cascade (labels adapt to country). */
export function buildLevelFieldStates(
  selection: AddressSelection,
  locale: LocaleCode = "es",
): LevelFieldState[] {
  const adapter = getAddressAdapter(selection.countryCode);
  const profile = adapter.getProfile(locale);

  const parentPopulated = (level: AdminLevelKey): boolean => {
    if (level === "admin1") return true;
    const parent = LEVEL_ORDER[LEVEL_ORDER.indexOf(level) - 1];
    return Boolean(
      getLevelCode(selection, parent) || selection.freeText?.[parent],
    );
  };

  return profile.levels.map((level) => {
    const options = level.hasCatalog
      ? adapter.getOptions(level.key, selection)
      : [];
    const valueCode = getLevelCode(selection, level.key);
    const free = selection.freeText?.[level.key] ?? "";
    const valueName = getLevelName(selection, level.key) || free;

    const disabled =
      !selection.countryCode ||
      (level.key !== "admin1" &&
        level.hasCatalog &&
        !parentPopulated(level.key));

    return {
      key: level.key,
      label: level.label[locale],
      mode: level.hasCatalog ? "select" : "text",
      options,
      valueCode,
      valueName: level.hasCatalog ? valueName : free || valueName,
      disabled,
    };
  });
}

/**
 * Apply a change to the master country or an admin level.
 * Changing a parent clears all dependent levels (cascade reset).
 */
export function applyAddressChange(
  current: AddressSelection,
  change: {
    countryCode?: string;
    level?: AdminLevelKey;
    code?: string;
    name?: string;
    freeText?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
  },
): AddressSelection {
  if (change.countryCode !== undefined) {
    const code = normalizeCountryCode(change.countryCode);
    return {
      ...emptySelectionForCountry(code),
      addressLine1: current.addressLine1,
      addressLine2: current.addressLine2,
      postalCode: current.postalCode,
    };
  }

  const next: AddressSelection = {
    ...current,
    freeText: { ...(current.freeText ?? {}) },
  };

  if (change.addressLine1 !== undefined) next.addressLine1 = change.addressLine1;
  if (change.addressLine2 !== undefined) next.addressLine2 = change.addressLine2;
  if (change.postalCode !== undefined) next.postalCode = change.postalCode;

  if (!change.level) return next;

  const adapter = getAddressAdapter(next.countryCode);
  const levelIndex = LEVEL_ORDER.indexOf(change.level);

  for (const level of LEVEL_ORDER.slice(levelIndex + 1)) {
    clearLevel(next, level);
  }

  const profile = adapter.getProfile();
  const def = profile.levels.find((l) => l.key === change.level);

  if (def?.hasCatalog) {
    const code = change.code ?? "";
    const name =
      change.name ||
      (code ? adapter.resolveName(change.level, code, next) : "");
    setLevel(next, change.level, code, name);
    if (next.freeText) delete next.freeText[change.level];
  } else {
    const text = change.freeText ?? change.name ?? "";
    setLevel(next, change.level, "", text);
    if (next.freeText) next.freeText[change.level] = text;
  }

  return next;
}

export function createEmptyAddressSelection(
  countryCode?: string,
): AddressSelection {
  // Explicit empty string = no country selected (e.g. required apply forms).
  if (countryCode === "") {
    return emptySelectionForCountry("");
  }
  return emptySelectionForCountry(normalizeCountryCode(countryCode) || "CL");
}
