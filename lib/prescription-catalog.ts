import type {
  DrugPresentationSummary,
  SmartMedicationSuggestion,
} from "./types/drug-catalog";
import type { MedicationItem } from "./services/prescriptions";

/** Maps a catalog presentation into a prescription line seed (PR-1). */
export function medicationItemFromPresentation(
  presentation: Pick<
    DrugPresentationSummary,
    "id" | "displayLabel" | "route"
  >,
): MedicationItem {
  return {
    name: presentation.displayLabel,
    drugPresentationId: presentation.id,
    route: presentation.route?.code || undefined,
  };
}

/** Maps a smart-suggestion row into a prescription line seed (PR-1). */
export function medicationItemFromSmartSuggestion(
  suggestion: SmartMedicationSuggestion,
): MedicationItem {
  return {
    name: suggestion.displayLabel,
    drugPresentationId: suggestion.id,
    route: suggestion.route?.code || undefined,
  };
}

export function formatPresentationSecondaryLine(
  presentation: Pick<
    DrugPresentationSummary,
    "strengthDisplay" | "dosageForm" | "brandName" | "isGeneric"
  >,
): string {
  const parts = [
    presentation.strengthDisplay,
    presentation.dosageForm,
    presentation.isGeneric ? "genérico" : presentation.brandName,
  ].filter((p) => Boolean(p && String(p).trim()));
  return parts.join(" · ");
}
