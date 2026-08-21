/**
 * Prescription Engine PR-2 — Composer working model.
 * Catalog identity stays on drugPresentationId; clinical fields are editable.
 * Does not invent Backend fields: maps 1:1 to MedicationItem (+ snapshot for UI).
 */

export type PrescriptionItemSource = "CATALOG" | "MANUAL" | "MAGISTRAL";

export type MagistralComponent = {
  ingredient: string;
  concentration: string;
  unit: string;
  quantity?: string;
};

export type MagistralFormula = {
  components: MagistralComponent[];
  vehicle?: string;
  finalQuantity?: string;
  instructions?: string;
};

export type SelectedMedication = {
  /** Persistent catalog identity when chosen from smart-suggestions / presentations. */
  drugPresentationId?: string;
  /** CATALOG keeps vademecum identity. MANUAL/MAGISTRAL are explicit physician routes. */
  source?: PrescriptionItemSource;
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
  magistral?: MagistralFormula;
};

export function emptyMagistralFormula(): MagistralFormula {
  return {
    components: [{ ingredient: "", concentration: "", unit: "" }],
  };
}

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

export function manualMedicationFromQuery(query: string): SelectedMedication {
  return {
    ...emptySelectedMedication(),
    source: "MANUAL",
    displayLabel: query.trim(),
  };
}

export function magistralMedicationFromQuery(
  query: string,
): SelectedMedication {
  return {
    ...emptySelectedMedication(),
    source: "MAGISTRAL",
    displayLabel: query.trim() || "Fórmula magistral",
    magistral: emptyMagistralFormula(),
  };
}

export function isSelectedMedicationReady(line: SelectedMedication): boolean {
  if (line.source === "MAGISTRAL") {
    return Boolean(
      line.magistral?.components.some((component) =>
        component.ingredient.trim(),
      ),
    );
  }
  return Boolean(line.displayLabel.trim());
}
