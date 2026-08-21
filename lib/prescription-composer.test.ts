import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyComposerDisplayLabel,
  catalogBindingSurvivesLabelEdit,
  clearCatalogIdentity,
  medicationItemFromSelectedMedication,
  medicationItemsFromSelectedMedications,
  mergeInstructionsAndObservations,
  selectedMedicationFromMedicationItem,
  selectedMedicationFromSmartSuggestion,
  selectedMedicationsFromMedicationItems,
  splitInstructionsAndObservations,
} from "./prescription-composer";
import { emptySelectedMedication } from "./types/selected-medication";
import type { SmartMedicationSuggestion } from "./types/drug-catalog";

const suggestion: SmartMedicationSuggestion = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  substanceId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  innName: "Amoxicilina",
  displayLabel: "Amoxicilina 500 mg cápsula",
  genericName: "Amoxicilina",
  brandName: null,
  strengthDisplay: "500 mg",
  dosageForm: "cápsula",
  route: { code: "PO", nameEs: "Oral" },
  jurisdictionCode: "CL",
  isGeneric: true,
  atcCode: "J01CA04",
  source: "search",
  isFavorite: false,
  preferenceScore: 1,
};

describe("prescription-composer (PR-2)", () => {
  it("hydrates SelectedMedication from smart suggestion with catalog snapshot", () => {
    const line = selectedMedicationFromSmartSuggestion(suggestion);
    assert.equal(line.drugPresentationId, suggestion.id);
    assert.equal(line.displayLabel, suggestion.displayLabel);
    assert.equal(line.strengthDisplay, "500 mg");
    assert.equal(line.dosageForm, "cápsula");
    assert.equal(line.routeCode, "PO");
    assert.equal(line.routeLabel, "Oral");
    assert.equal(line.innName, "Amoxicilina");
  });

  it("preserves dosage/frequency when re-selecting presentation", () => {
    const previous = {
      ...emptySelectedMedication(),
      dosage: "1 cápsula",
      frequency: "c/8 h",
      duration: "7 días",
    };
    const line = selectedMedicationFromSmartSuggestion(suggestion, previous);
    assert.equal(line.dosage, "1 cápsula");
    assert.equal(line.frequency, "c/8 h");
    assert.equal(line.duration, "7 días");
    assert.equal(line.drugPresentationId, suggestion.id);
  });

  it("round-trips MedicationItem ↔ SelectedMedication with drugPresentationId", () => {
    const selected = selectedMedicationFromSmartSuggestion(suggestion);
    selected.dosage = "1 cápsula";
    selected.frequency = "c/8 h";
    selected.duration = "7 días";
    selected.instructions = "con alimentos";
    selected.observations = "sin alergias conocidas";

    const item = medicationItemFromSelectedMedication(selected);
    assert.equal(item.name, selected.displayLabel);
    assert.equal(item.drugPresentationId, suggestion.id);
    assert.equal(item.route, "PO");
    assert.equal(item.duration, "7 días");
    assert.match(item.instructions ?? "", /con alimentos/);
    assert.match(item.instructions ?? "", /Obs\.:/);

    const again = selectedMedicationFromMedicationItem(item);
    assert.equal(again.drugPresentationId, suggestion.id);
    assert.equal(again.instructions, "con alimentos");
    assert.equal(again.observations, "sin alergias conocidas");
  });

  it("clears catalog identity on free-text edit", () => {
    const line = selectedMedicationFromSmartSuggestion(suggestion);
    const cleared = clearCatalogIdentity(line, "Texto libre");
    assert.equal(cleared.displayLabel, "Texto libre");
    assert.equal(cleared.drugPresentationId, undefined);
    assert.equal(cleared.strengthDisplay, undefined);
  });

  it("keeps drugPresentationId when the label still refers to the selected presentation", () => {
    const line = selectedMedicationFromSmartSuggestion(suggestion);
    const same = applyComposerDisplayLabel(line, line.displayLabel);
    assert.equal(same.drugPresentationId, suggestion.id);
    const typedChar = applyComposerDisplayLabel(line, `${line.displayLabel} `);
    assert.equal(typedChar.drugPresentationId, suggestion.id);
    const prefix = applyComposerDisplayLabel(line, "Amoxicilina");
    assert.equal(prefix.drugPresentationId, suggestion.id);
    const persisted = medicationItemFromSelectedMedication(typedChar);
    assert.equal(persisted.drugPresentationId, suggestion.id);
  });

  it("unbinds catalog identity only when the label no longer corresponds", () => {
    const line = selectedMedicationFromSmartSuggestion(suggestion);
    const unbound = applyComposerDisplayLabel(line, "Ibuprofeno 400 mg");
    assert.equal(unbound.drugPresentationId, undefined);
    assert.equal(unbound.displayLabel, "Ibuprofeno 400 mg");
    assert.equal(catalogBindingSurvivesLabelEdit(line.displayLabel, ""), false);
  });

  it("filters empty lines when serializing to MedicationItem[]", () => {
    const items = medicationItemsFromSelectedMedications([
      emptySelectedMedication(),
      selectedMedicationFromSmartSuggestion(suggestion),
    ]);
    assert.equal(items.length, 1);
    assert.equal(items[0]!.drugPresentationId, suggestion.id);
  });

  it("hydrates list from persisted medications", () => {
    const lines = selectedMedicationsFromMedicationItems([
      {
        name: "Ibuprofeno 400 mg",
        dosage: "1",
        frequency: "c/8 h",
      },
    ]);
    assert.equal(lines.length, 1);
    assert.equal(lines[0]!.displayLabel, "Ibuprofeno 400 mg");
  });

  it("rehydrates drugPresentationId from a persisted MedicationItem", () => {
    const lines = selectedMedicationsFromMedicationItems([
      {
        name: "Amoxicilina 500 mg cápsula",
        drugPresentationId: suggestion.id,
        dosage: "1 cápsula",
        frequency: "c/8 h",
        duration: "7 días",
      },
    ]);
    assert.equal(lines[0]!.drugPresentationId, suggestion.id);
    const item = medicationItemFromSelectedMedication(lines[0]!);
    assert.equal(item.drugPresentationId, suggestion.id);
  });

  it("merges and splits instructions/observations stably", () => {
    const merged = mergeInstructionsAndObservations(
      "con comida",
      "control en 7 días",
    );
    assert.ok(merged);
    const split = splitInstructionsAndObservations(merged!);
    assert.equal(split.instructions, "con comida");
    assert.equal(split.observations, "control en 7 días");
  });
});
