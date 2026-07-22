import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatPresentationSecondaryLine,
  medicationItemFromPresentation,
  medicationItemFromSmartSuggestion,
} from "../prescription-catalog";
import type { SmartMedicationSuggestion } from "../types/drug-catalog";

describe("prescription-catalog (PR-1)", () => {
  it("maps presentation to MedicationItem with drugPresentationId", () => {
    const item = medicationItemFromPresentation({
      id: "11111111-1111-4111-8111-111111111111",
      displayLabel: "Paracetamol 500 mg comprimido",
      route: { code: "PO", nameEs: "Oral" },
    });
    assert.equal(item.name, "Paracetamol 500 mg comprimido");
    assert.equal(item.drugPresentationId, "11111111-1111-4111-8111-111111111111");
    assert.equal(item.route, "PO");
  });

  it("maps smart suggestion to MedicationItem", () => {
    const suggestion: SmartMedicationSuggestion = {
      id: "22222222-2222-4222-8222-222222222222",
      substanceId: "33333333-3333-4333-8333-333333333333",
      innName: "Paracetamol",
      displayLabel: "Paracetamol 500 mg comprimido",
      genericName: "Paracetamol",
      brandName: null,
      strengthDisplay: "500 mg",
      dosageForm: "comprimido",
      route: { code: "PO", nameEs: "Oral" },
      jurisdictionCode: "CL",
      isGeneric: true,
      atcCode: "N02BE01",
      source: "search",
      isFavorite: false,
      preferenceScore: 1,
    };
    const item = medicationItemFromSmartSuggestion(suggestion);
    assert.equal(item.drugPresentationId, suggestion.id);
    assert.equal(item.name, suggestion.displayLabel);
  });

  it("formats secondary presentation line", () => {
    const line = formatPresentationSecondaryLine({
      strengthDisplay: "500 mg",
      dosageForm: "comprimido",
      brandName: null,
      isGeneric: true,
    });
    assert.match(line, /500 mg/);
    assert.match(line, /genérico/);
  });
});

describe("smart-suggestions response shape", () => {
  it("unwraps Nest envelope { data: SmartSuggestionsResult }", () => {
    const apiBody = {
      data: {
        diagnosisContext: null,
        suggested: [
          {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            displayLabel: "Ibuprofeno 400 mg comprimido",
          },
        ],
        favorites: [],
        recent: [],
        frequent: [],
        personalPatterns: [],
        warnings: [],
      },
    };
    const suggested = apiBody.data.suggested ?? [];
    assert.equal(suggested.length, 1);
    assert.match(suggested[0]!.displayLabel, /Ibuprofeno/);
  });
});

/**
 * Contrato legacy: `{ data: string[] }`.
 * Mantener unwrap para compatibilidad de tests históricos.
 */
describe("suggest-medications response shape (legacy)", () => {
  it("unwraps Nest envelope { data: string[] }", () => {
    const apiBody = {
      data: ["Paracetamol 500 mg comprimido", "Paracetamol 1000 mg comprimido"],
    };
    const list = (apiBody as { data?: string[] }).data ?? [];
    assert.equal(list.length, 2);
    assert.match(list[0]!, /Paracetamol/);
  });

  it("does not treat nested data.data as required", () => {
    const apiBody = {
      data: ["Ibuprofeno 400 mg comprimido"],
    };
    const wrong = (apiBody as { data?: { data?: string[] } }).data?.data ?? [];
    const correct = (apiBody as { data?: string[] }).data ?? [];
    assert.equal(wrong.length, 0);
    assert.equal(correct.length, 1);
  });
});
