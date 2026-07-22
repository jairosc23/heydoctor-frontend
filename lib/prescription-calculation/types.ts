/**
 * Prescription Engine PR-3 — Calculation Engine types (enriched model).
 * Pure clinical calculation; no persistence / Safety / Backend coupling.
 *
 * Concepts are explicit and never overloaded:
 * - dosePerAdministration
 * - administrationsPerDay
 * - dailyConsumption
 * - totalQuantity
 */

export type CalculationStatus =
  | "deterministic"
  | "non_deterministic"
  | "incomplete"
  | "unsupported";

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

export type CalculationReasonCode =
  | "missing_dosage"
  | "missing_frequency"
  | "missing_duration"
  | "unparseable_dosage"
  | "unparseable_frequency"
  | "unparseable_duration"
  | "prn_non_deterministic"
  | "invalid_interval"
  | "unsupported_pattern";

/** Structured math explanation for a deterministic result. */
export type MathExplanation = {
  dosePerAdministration: number;
  administrationsPerDay: number;
  durationDays: number;
  dailyConsumption: number;
  totalQuantity: number;
  unit: string;
  /**
   * Example:
   * "2 comprimidos × 2 administraciones/día × 10 días = 40 comprimidos"
   */
  formula: string;
};

/**
 * Enriched calculation result.
 * All derived values are exposed as distinct fields.
 */
export type CalculationResult = {
  status: CalculationStatus;
  reasonCode?: CalculationReasonCode;

  /** Dosis por administración (p. ej. 2 comprimidos). */
  dosePerAdministration?: number;
  /** Administraciones por día (p. ej. 2 si c/12 h). */
  administrationsPerDay?: number;
  /** Consumo diario = dosePerAdministration × administrationsPerDay. */
  dailyConsumption?: number;
  /** Duración del tratamiento en días. */
  durationDays?: number;
  /** Cantidad total = dailyConsumption × durationDays. */
  totalQuantity?: number;
  /**
   * Cantidad final según presentación.
   * PR-3: equals totalQuantity (pack-size not in FE catalog yet).
   */
  finalQuantity?: number;
  /** Unidad clínica de la cantidad (comprimido, mL, aplicación…). */
  unit?: string;

  /** Present only when status === "deterministic". */
  explanation?: MathExplanation;

  display: {
    quantity: string;
    dailyConsumption: string;
    duration: string;
    explanation: string;
  };
};

export function emptyCalculationDisplay(): CalculationResult["display"] {
  return {
    quantity: "—",
    dailyConsumption: "—",
    duration: "—",
    explanation: "—",
  };
}
