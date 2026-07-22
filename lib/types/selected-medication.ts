/**
 * Prescription Engine PR-2 — Composer working model.
 * Catalog identity stays on drugPresentationId; clinical fields are editable.
 * Does not invent Backend fields: maps 1:1 to MedicationItem (+ snapshot for UI).
 */

export type SelectedMedication = {
  /** Persistent catalog identity when chosen from smart-suggestions / presentations. */
  drugPresentationId?: string;
  /** Display name / presentation label (Medicamento). */
  displayLabel: string;
  /** INN / principio activo (read-only snapshot). */
  innName?: string;
  /** Concentración (read-only snapshot from catalog). */
  strengthDisplay?: string;
  /** Forma farmacéutica (read-only snapshot). */
  dosageForm?: string;
  /** Vía — code for persistence. */
  routeCode?: string;
  /** Vía — label for display. */
  routeLabel?: string;
  /** Dosis (editable). */
  dosage: string;
  /** Frecuencia / posología (editable). */
  frequency: string;
  /** Duración (editable). */
  duration: string;
  /** Instrucciones al paciente → MedicationItem.instructions. */
  instructions: string;
  /**
   * Observaciones de línea (composer).
   * Persistidas en Backend concatenadas en `instructions` si hay contenido
   * (el DTO no tiene campo observations separado).
   */
  observations: string;
};

export function emptySelectedMedication(): SelectedMedication {
  return {
    displayLabel: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    observations: "",
  };
}

export function isSelectedMedicationReady(line: SelectedMedication): boolean {
  return Boolean(line.displayLabel.trim());
}
