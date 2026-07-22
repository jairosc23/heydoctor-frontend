/**
 * Public API — Prescription Calculation Engine (PR-3).
 * Isolated from Composer math and from Persistence DTOs.
 */

export {
  calculatePrescription,
  calculateFromSelectedMedication,
  buildExplanation,
} from "./engine";
export type {
  CalculationInput,
  CalculationResult,
  CalculationStatus,
  CalculationReasonCode,
  MathExplanation,
} from "./types";
export { emptyCalculationDisplay } from "./types";
