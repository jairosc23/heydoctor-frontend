/**
 * Prescription Engine PR-3 — Calculation Engine types.
 * Pure clinical calculation; no persistence / Safety / Backend coupling.
 */

export type CalculationStatus =
  | "computed"
  | "incomplete"
  | "non_deterministic";

export type CalculationInput = {
  dosage: string;
  frequency: string;
  duration: string;
  /** Presentation form snapshot (cápsula, solución, etc.) — labels only. */
  dosageForm?: string;
  /** Strength snapshot — not used for math in PR-3. */
  strengthDisplay?: string;
};

export type ParsedDose = {
  amount: number;
  unit: string;
};

export type CalculationResult = {
  status: CalculationStatus;
  /** Why calculation did not complete (when not computed). */
  reasonCode?:
    | "missing_dosage"
    | "missing_frequency"
    | "missing_duration"
    | "unparseable_dosage"
    | "unparseable_frequency"
    | "unparseable_duration"
    | "prn_non_deterministic"
    | "invalid_interval";
  doseAmount?: number;
  doseUnit?: string;
  /** Administrations per day (deterministic). */
  dosesPerDay?: number;
  durationDays?: number;
  /** doseAmount × dosesPerDay */
  dailyConsumption?: number;
  /** dailyConsumption × durationDays */
  totalQuantity?: number;
  /**
   * Final dispense quantity for the presentation unit.
   * PR-3: equals totalQuantity (no pack-size catalog field yet).
   */
  finalQuantity?: number;
  quantityUnit?: string;
  display: {
    quantity: string;
    dailyConsumption: string;
    duration: string;
  };
};

export function emptyCalculationDisplay(): CalculationResult["display"] {
  return {
    quantity: "—",
    dailyConsumption: "—",
    duration: "—",
  };
}
