/**
 * Bridge StructuredPosology → Calculation Engine input (PR-3).
 * Domain stays SSOT; engine still consumes documented string patterns.
 */

import { calculatePrescription } from "@/lib/prescription-calculation";
import type { CalculationResult } from "@/lib/prescription-calculation";
import type { JurisdictionCode, MedicationOrderLine } from "../types";
import { legacyStringsFromPosology } from "./legacy-medication";

export function calculateFromOrderLine(
  line: MedicationOrderLine,
  jurisdictionCode: JurisdictionCode = "CL",
): CalculationResult {
  const strings = legacyStringsFromPosology(line.posology, jurisdictionCode);
  return calculatePrescription({
    dosage: strings.dosage,
    frequency: strings.frequency,
    duration: strings.duration,
    dosageForm: line.product.doseForm,
    strengthDisplay: line.product.strengthDisplay,
  });
}
