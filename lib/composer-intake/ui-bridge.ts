/**
 * Bridge CompositionState clinical fields ↔ Composer SelectedMedication UI.
 * Structural only — no clinical inference.
 */

import {
  medicationItemsFromSelectedMedications,
  selectedMedicationsFromMedicationItems,
} from "@/lib/prescription-composer";
import type { SelectedMedication } from "@/lib/types/selected-medication";
import type { ClinicalAssistMedication, CompositionState } from "./types";

export function selectedMedicationsFromAssistMedications(
  medications: ClinicalAssistMedication[],
): SelectedMedication[] {
  return selectedMedicationsFromMedicationItems(medications);
}

export function assistMedicationsFromSelectedMedications(
  lines: SelectedMedication[],
): ClinicalAssistMedication[] {
  return medicationItemsFromSelectedMedications(lines).map((m) => ({
    name: m.name,
    ...(m.drugPresentationId
      ? { drugPresentationId: m.drugPresentationId }
      : {}),
    ...(m.dosage ? { dosage: m.dosage } : {}),
    ...(m.frequency ? { frequency: m.frequency } : {}),
    ...(m.duration ? { duration: m.duration } : {}),
    ...(m.route ? { route: m.route } : {}),
    ...(m.instructions ? { instructions: m.instructions } : {}),
  }));
}

/** Project Composition State onto form fields (Composer ownership). */
export function projectCompositionStateToForm(state: CompositionState): {
  diagnosis: string;
  notes: string;
  lines: SelectedMedication[];
} {
  return {
    diagnosis: state.diagnosis ?? "",
    notes: state.notes ?? "",
    lines: selectedMedicationsFromAssistMedications(state.medications),
  };
}
