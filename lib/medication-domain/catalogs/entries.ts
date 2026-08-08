/**
 * Controlled vocabularies — shared codes; labels by locale.
 * Jurisdiction selects which catalog pack to expose (P0: same clinical set for CL/CO/US/ES).
 * Implements ADR-020.
 */

import type { CatalogEntry } from "../types";

export const DOSE_FORMS: CatalogEntry[] = [
  { code: "tablet", labelEs: "Comprimido", labelEn: "Tablet" },
  { code: "scored_tablet", labelEs: "Tableta", labelEn: "Scored tablet" },
  { code: "capsule", labelEs: "Cápsula", labelEn: "Capsule" },
  { code: "sachet", labelEs: "Sobre", labelEn: "Sachet" },
  { code: "ampoule", labelEs: "Ampolla", labelEn: "Ampoule" },
  { code: "vial", labelEs: "Vial", labelEn: "Vial" },
  { code: "syrup", labelEs: "Jarabe", labelEn: "Syrup" },
  { code: "suspension", labelEs: "Suspensión", labelEn: "Suspension" },
  { code: "drops", labelEs: "Gotas", labelEn: "Drops" },
  { code: "cream", labelEs: "Crema", labelEn: "Cream" },
  { code: "gel", labelEs: "Gel", labelEn: "Gel" },
  { code: "spray", labelEs: "Spray", labelEn: "Spray" },
  { code: "inhaler", labelEs: "Inhalador", labelEn: "Inhaler" },
  { code: "patch", labelEs: "Parche", labelEn: "Patch" },
  { code: "pessary", labelEs: "Óvulo", labelEn: "Pessary" },
  { code: "suppository", labelEs: "Supositorio", labelEn: "Suppository" },
];

export const DOSE_UNITS: CatalogEntry[] = [
  { code: "tablet", labelEs: "comprimido", labelEn: "tablet" },
  { code: "capsule", labelEs: "cápsula", labelEn: "capsule" },
  { code: "mL", labelEs: "mL", labelEn: "mL" },
  { code: "drop", labelEs: "gota", labelEn: "drop" },
  { code: "puff", labelEs: "puff", labelEn: "puff" },
  { code: "ampoule", labelEs: "ampolla", labelEn: "ampoule" },
  { code: "vial", labelEs: "vial", labelEn: "vial" },
  { code: "patch", labelEs: "parche", labelEn: "patch" },
  { code: "application", labelEs: "aplicación", labelEn: "application" },
];

export const DOSE_AMOUNT_PRESETS: Array<{ amount: number; unit: string }> = [
  { amount: 0.5, unit: "tablet" },
  { amount: 1, unit: "tablet" },
  { amount: 2, unit: "tablet" },
  { amount: 5, unit: "mL" },
  { amount: 10, unit: "mL" },
  { amount: 20, unit: "drop" },
  { amount: 1, unit: "ampoule" },
  { amount: 2, unit: "puff" },
];

/** Frequency catalog codes map to FrequencySpec via parseFrequencyCode. */
export const FREQUENCIES: CatalogEntry[] = [
  { code: "EVERY_4_HOURS", labelEs: "Cada 4 horas", labelEn: "Every 4 hours" },
  { code: "EVERY_6_HOURS", labelEs: "Cada 6 horas", labelEn: "Every 6 hours" },
  { code: "EVERY_8_HOURS", labelEs: "Cada 8 horas", labelEn: "Every 8 hours" },
  { code: "EVERY_12_HOURS", labelEs: "Cada 12 horas", labelEn: "Every 12 hours" },
  { code: "EVERY_24_HOURS", labelEs: "Cada 24 horas", labelEn: "Every 24 hours" },
  { code: "EVERY_48_HOURS", labelEs: "Cada 48 horas", labelEn: "Every 48 hours" },
  { code: "EVERY_72_HOURS", labelEs: "Cada 72 horas", labelEn: "Every 72 hours" },
  { code: "ONCE_DAILY", labelEs: "Una vez al día", labelEn: "Once daily" },
  { code: "TWICE_DAILY", labelEs: "Dos veces al día", labelEn: "Twice daily" },
  { code: "THREE_TIMES_DAILY", labelEs: "Tres veces al día", labelEn: "Three times daily" },
  { code: "FOUR_TIMES_DAILY", labelEs: "Cuatro veces al día", labelEn: "Four times daily" },
  { code: "EVERY_OTHER_DAY", labelEs: "Día por medio", labelEn: "Every other day" },
  { code: "SATURDAY_ONLY", labelEs: "Solo sábados", labelEn: "Saturdays only" },
  { code: "WEEKEND_ONLY", labelEs: "Sábados y domingos", labelEn: "Weekends only" },
  { code: "WEEKLY", labelEs: "Cada semana", labelEn: "Weekly" },
  { code: "EVERY_2_WEEKS", labelEs: "Cada 15 días", labelEn: "Every 2 weeks" },
  { code: "MONTHLY", labelEs: "Cada mes", labelEn: "Monthly" },
];

export const DURATIONS: CatalogEntry[] = [
  { code: "DAYS_3", labelEs: "3 días", labelEn: "3 days" },
  { code: "DAYS_5", labelEs: "5 días", labelEn: "5 days" },
  { code: "DAYS_7", labelEs: "7 días", labelEn: "7 days" },
  { code: "DAYS_10", labelEs: "10 días", labelEn: "10 days" },
  { code: "DAYS_14", labelEs: "14 días", labelEn: "14 days" },
  { code: "DAYS_21", labelEs: "21 días", labelEn: "21 days" },
  { code: "DAYS_30", labelEs: "30 días", labelEn: "30 days" },
  { code: "WEEKS_6", labelEs: "6 semanas", labelEn: "6 weeks" },
  { code: "MONTHS_2", labelEs: "2 meses", labelEn: "2 months" },
  { code: "MONTHS_3", labelEs: "3 meses", labelEn: "3 months" },
  { code: "CONTINUOUS", labelEs: "Uso continuo", labelEn: "Continuous use" },
];

export const ROUTES: CatalogEntry[] = [
  { code: "oral", labelEs: "Oral", labelEn: "Oral" },
  { code: "sublingual", labelEs: "Sublingual", labelEn: "Sublingual" },
  { code: "im", labelEs: "Intramuscular", labelEn: "Intramuscular" },
  { code: "iv", labelEs: "Intravenosa", labelEn: "Intravenous" },
  { code: "sc", labelEs: "Subcutánea", labelEn: "Subcutaneous" },
  { code: "rectal", labelEs: "Rectal", labelEn: "Rectal" },
  { code: "vaginal", labelEs: "Vaginal", labelEn: "Vaginal" },
  { code: "nasal", labelEs: "Nasal", labelEn: "Nasal" },
  { code: "otic", labelEs: "Ótica", labelEn: "Otic" },
  { code: "ophthalmic", labelEs: "Oftálmica", labelEn: "Ophthalmic" },
  { code: "inhalation", labelEs: "Inhalatoria", labelEn: "Inhalation" },
  { code: "topical", labelEs: "Tópica", labelEn: "Topical" },
];

export const TIMING_INSTRUCTIONS: CatalogEntry[] = [
  { code: "with_food", labelEs: "Con alimentos", labelEn: "With food" },
  { code: "after_meals", labelEs: "Después de las comidas", labelEn: "After meals" },
  { code: "before_sleep", labelEs: "Antes de dormir", labelEn: "Before sleep" },
  { code: "empty_stomach", labelEs: "En ayunas", labelEn: "On empty stomach" },
  { code: "as_needed", labelEs: "Según necesidad", labelEn: "As needed" },
  { code: "if_pain", labelEs: "Si presenta dolor", labelEn: "If pain" },
  { code: "if_fever", labelEs: "Si presenta fiebre", labelEn: "If fever" },
];
