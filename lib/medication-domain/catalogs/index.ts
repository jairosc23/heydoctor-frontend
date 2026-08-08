/**
 * MedicationCatalog — jurisdiction-scoped controlled vocabularies (ADR-020 P0).
 */

import type {
  CatalogEntry,
  DurationSpec,
  FrequencySpec,
  JurisdictionCode,
} from "../types";
import {
  DOSE_AMOUNT_PRESETS,
  DOSE_FORMS,
  DOSE_UNITS,
  DURATIONS,
  FREQUENCIES,
  ROUTES,
  TIMING_INSTRUCTIONS,
} from "./entries";

export type CatalogLocale = "es" | "en";

export type JurisdictionCatalog = {
  jurisdictionCode: JurisdictionCode;
  locale: CatalogLocale;
  doseForms: CatalogEntry[];
  doseUnits: CatalogEntry[];
  doseAmountPresets: Array<{ amount: number; unit: string }>;
  frequencies: CatalogEntry[];
  durations: CatalogEntry[];
  routes: CatalogEntry[];
  timingInstructions: CatalogEntry[];
};

const JURISDICTION_LOCALE: Record<JurisdictionCode, CatalogLocale> = {
  CL: "es",
  CO: "es",
  ES: "es",
  US: "en",
};

export function labelFor(
  entry: CatalogEntry,
  locale: CatalogLocale,
): string {
  return locale === "en" ? entry.labelEn : entry.labelEs;
}

export function getCatalog(
  jurisdictionCode: JurisdictionCode,
): JurisdictionCatalog {
  const locale = JURISDICTION_LOCALE[jurisdictionCode];
  return {
    jurisdictionCode,
    locale,
    doseForms: DOSE_FORMS,
    doseUnits: DOSE_UNITS,
    doseAmountPresets: DOSE_AMOUNT_PRESETS,
    frequencies: FREQUENCIES,
    durations: DURATIONS,
    routes: ROUTES,
    timingInstructions: TIMING_INSTRUCTIONS,
  };
}

export function findEntry(
  entries: CatalogEntry[],
  code: string | null | undefined,
): CatalogEntry | undefined {
  if (!code) return undefined;
  return entries.find((e) => e.code === code);
}

export function frequencySpecFromCode(code: string): FrequencySpec | null {
  switch (code) {
    case "EVERY_4_HOURS":
      return { kind: "EVERY_N_HOURS", hours: 4 };
    case "EVERY_6_HOURS":
      return { kind: "EVERY_N_HOURS", hours: 6 };
    case "EVERY_8_HOURS":
      return { kind: "EVERY_N_HOURS", hours: 8 };
    case "EVERY_12_HOURS":
      return { kind: "EVERY_N_HOURS", hours: 12 };
    case "EVERY_24_HOURS":
      return { kind: "EVERY_N_HOURS", hours: 24 };
    case "EVERY_48_HOURS":
      return { kind: "EVERY_N_HOURS", hours: 48 };
    case "EVERY_72_HOURS":
      return { kind: "EVERY_N_HOURS", hours: 72 };
    case "ONCE_DAILY":
      return { kind: "TIMES_PER_DAY", times: 1 };
    case "TWICE_DAILY":
      return { kind: "TIMES_PER_DAY", times: 2 };
    case "THREE_TIMES_DAILY":
      return { kind: "TIMES_PER_DAY", times: 3 };
    case "FOUR_TIMES_DAILY":
      return { kind: "TIMES_PER_DAY", times: 4 };
    case "EVERY_OTHER_DAY":
      return { kind: "EVERY_N_DAYS", days: 2 };
    case "SATURDAY_ONLY":
      return { kind: "SATURDAY_ONLY" };
    case "WEEKEND_ONLY":
      return { kind: "WEEKEND_ONLY" };
    case "WEEKLY":
      return { kind: "WEEKLY" };
    case "EVERY_2_WEEKS":
      return { kind: "EVERY_N_WEEKS", weeks: 2 };
    case "MONTHLY":
      return { kind: "MONTHLY" };
    default:
      return { kind: "CUSTOM", code };
  }
}

export function frequencyCodeFromSpec(spec: FrequencySpec | null): string | null {
  if (!spec) return null;
  switch (spec.kind) {
    case "EVERY_N_HOURS":
      return `EVERY_${spec.hours}_HOURS`;
    case "TIMES_PER_DAY": {
      const map: Record<number, string> = {
        1: "ONCE_DAILY",
        2: "TWICE_DAILY",
        3: "THREE_TIMES_DAILY",
        4: "FOUR_TIMES_DAILY",
      };
      return map[spec.times] ?? `CUSTOM_TID_${spec.times}`;
    }
    case "EVERY_N_DAYS":
      return spec.days === 2 ? "EVERY_OTHER_DAY" : `EVERY_${spec.days}_DAYS`;
    case "WEEKLY":
      return "WEEKLY";
    case "EVERY_N_WEEKS":
      return spec.weeks === 2 ? "EVERY_2_WEEKS" : `EVERY_${spec.weeks}_WEEKS`;
    case "MONTHLY":
      return "MONTHLY";
    case "WEEKEND_ONLY":
      return "WEEKEND_ONLY";
    case "SATURDAY_ONLY":
      return "SATURDAY_ONLY";
    case "CUSTOM":
      return spec.code;
  }
}

export function durationSpecFromCode(code: string): DurationSpec | null {
  if (code === "CONTINUOUS") return { kind: "CONTINUOUS" };
  if (code === "UNTIL_ORDER") return { kind: "UNTIL_ORDER" };
  const days = /^DAYS_(\d+)$/.exec(code);
  if (days) return { kind: "N_DAYS", days: Number(days[1]) };
  const weeks = /^WEEKS_(\d+)$/.exec(code);
  if (weeks) return { kind: "N_WEEKS", weeks: Number(weeks[1]) };
  const months = /^MONTHS_(\d+)$/.exec(code);
  if (months) return { kind: "N_MONTHS", months: Number(months[1]) };
  return { kind: "CUSTOM", code };
}

export function durationCodeFromSpec(spec: DurationSpec | null): string | null {
  if (!spec) return null;
  switch (spec.kind) {
    case "N_DAYS":
      return `DAYS_${spec.days}`;
    case "N_WEEKS":
      return `WEEKS_${spec.weeks}`;
    case "N_MONTHS":
      return `MONTHS_${spec.months}`;
    case "CONTINUOUS":
      return "CONTINUOUS";
    case "UNTIL_ORDER":
      return "UNTIL_ORDER";
    case "CUSTOM":
      return spec.code;
  }
}

export {
  DOSE_FORMS,
  DOSE_UNITS,
  DOSE_AMOUNT_PRESETS,
  FREQUENCIES,
  DURATIONS,
  ROUTES,
  TIMING_INSTRUCTIONS,
};
