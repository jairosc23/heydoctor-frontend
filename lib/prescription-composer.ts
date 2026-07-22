import type { SmartMedicationSuggestion } from "./types/drug-catalog";
import type { SelectedMedication } from "./types/selected-medication";
import { emptySelectedMedication } from "./types/selected-medication";
import type { MedicationItem } from "./services/prescriptions";

const OBS_PREFIX = "Obs.: ";

/** Apply catalog presentation defaults without re-fetching the catalog. */
export function selectedMedicationFromSmartSuggestion(
  suggestion: SmartMedicationSuggestion,
  previous?: SelectedMedication,
): SelectedMedication {
  const base = previous ?? emptySelectedMedication();
  return {
    ...base,
    drugPresentationId: suggestion.id,
    displayLabel: suggestion.displayLabel,
    innName: suggestion.innName || undefined,
    strengthDisplay: suggestion.strengthDisplay || undefined,
    dosageForm: suggestion.dosageForm || undefined,
    routeCode: suggestion.route?.code || undefined,
    routeLabel: suggestion.route?.nameEs || suggestion.route?.code || undefined,
    // Keep clinical fields the doctor may have started typing.
    dosage: base.dosage,
    frequency: base.frequency,
    duration: base.duration,
    instructions: base.instructions,
    observations: base.observations,
  };
}

/** Hydrate composer line from persisted MedicationItem (edit / legacy). */
export function selectedMedicationFromMedicationItem(
  item: MedicationItem,
): SelectedMedication {
  const { instructions, observations } = splitInstructionsAndObservations(
    item.instructions ?? "",
  );
  return {
    drugPresentationId: item.drugPresentationId,
    displayLabel: item.name ?? "",
    routeCode: item.route,
    routeLabel: item.route,
    dosage: item.dosage ?? "",
    frequency: item.frequency ?? "",
    duration: item.duration ?? "",
    instructions,
    observations,
  };
}

/**
 * Composer → persistence DTO.
 * Preserves drugPresentationId; does not send free-text-only catalog fields.
 */
export function medicationItemFromSelectedMedication(
  line: SelectedMedication,
): MedicationItem {
  return {
    name: line.displayLabel.trim(),
    drugPresentationId: line.drugPresentationId,
    dosage: line.dosage.trim() || undefined,
    frequency: line.frequency.trim() || undefined,
    duration: line.duration.trim() || undefined,
    route: line.routeCode?.trim() || undefined,
    instructions: mergeInstructionsAndObservations(
      line.instructions,
      line.observations,
    ),
  };
}

export function selectedMedicationsFromMedicationItems(
  items: MedicationItem[] | null | undefined,
): SelectedMedication[] {
  if (!items?.length) return [emptySelectedMedication()];
  return items.map(selectedMedicationFromMedicationItem);
}

export function medicationItemsFromSelectedMedications(
  lines: SelectedMedication[],
): MedicationItem[] {
  return lines
    .filter(isReady)
    .map(medicationItemFromSelectedMedication);
}

function isReady(line: SelectedMedication): boolean {
  return Boolean(line.displayLabel.trim());
}

export function mergeInstructionsAndObservations(
  instructions: string,
  observations: string,
): string | undefined {
  const instr = instructions.trim();
  const obs = observations.trim();
  if (!instr && !obs) return undefined;
  if (!obs) return instr;
  if (!instr) return `${OBS_PREFIX}${obs}`;
  return `${instr}\n${OBS_PREFIX}${obs}`;
}

export function splitInstructionsAndObservations(raw: string): {
  instructions: string;
  observations: string;
} {
  const text = raw.trim();
  if (!text) return { instructions: "", observations: "" };
  const marker = `\n${OBS_PREFIX}`;
  const idx = text.lastIndexOf(marker);
  if (idx >= 0) {
    return {
      instructions: text.slice(0, idx).trim(),
      observations: text.slice(idx + marker.length).trim(),
    };
  }
  if (text.startsWith(OBS_PREFIX)) {
    return {
      instructions: "",
      observations: text.slice(OBS_PREFIX.length).trim(),
    };
  }
  return { instructions: text, observations: "" };
}

export function clearCatalogIdentity(
  line: SelectedMedication,
  displayLabel: string,
): SelectedMedication {
  return {
    ...line,
    displayLabel,
    drugPresentationId: undefined,
    innName: undefined,
    strengthDisplay: undefined,
    dosageForm: undefined,
    routeCode: undefined,
    routeLabel: undefined,
  };
}
