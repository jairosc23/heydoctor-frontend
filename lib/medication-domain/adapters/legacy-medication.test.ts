import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  legacyStringsFromPosology,
  orderLineFromSelectedMedication,
  selectedMedicationFromOrderLine,
  medicationItemFromOrderLine,
} from "./legacy-medication";
import { emptyPosology } from "../types";
import { frequencySpecFromCode, durationSpecFromCode } from "../catalogs";
import { emptySelectedMedication } from "@/lib/types/selected-medication";
import { calculateFromOrderLine } from "./calculation-bridge";

describe("Legacy medication adapter (P1)", () => {
  it("round-trips structured posology through SelectedMedication without comma-join", () => {
    const posology = emptyPosology();
    posology.dose = { amount: 1, unit: "tablet" };
    posology.frequency = frequencySpecFromCode("EVERY_8_HOURS");
    posology.duration = durationSpecFromCode("DAYS_7");
    posology.route = "oral";

    const strings = legacyStringsFromPosology(posology, "CL");
    assert.equal(strings.dosage.includes("1"), true);
    assert.equal(strings.frequency.toLowerCase().includes("cada 8"), true);
    assert.equal(strings.duration.includes("7"), true);
    assert.equal(`${strings.dosage}, ${strings.frequency}`.includes("1, 8 HORAS"), false);

    const selected = emptySelectedMedication();
    selected.displayLabel = "Paracetamol 500 mg";
    selected.dosage = strings.dosage;
    selected.frequency = strings.frequency;
    selected.duration = strings.duration;
    selected.routeCode = "oral";

    const line = orderLineFromSelectedMedication(selected, "l1", "CL");
    assert.equal(line.posology.dose?.amount, 1);
    assert.equal(line.posology.frequency?.kind, "EVERY_N_HOURS");
    assert.equal(line.posology.duration?.kind, "N_DAYS");

    const back = selectedMedicationFromOrderLine(line, "CL");
    assert.equal(back.displayLabel, "Paracetamol 500 mg");
    assert.ok(back.frequency.toLowerCase().includes("cada 8"));

    const item = medicationItemFromOrderLine(line, "CL");
    assert.equal(item.name, "Paracetamol 500 mg");
    assert.ok(item.frequency?.toLowerCase().includes("cada"));
  });

  it("feeds Calculation Engine with parser-friendly strings", () => {
    const selected = emptySelectedMedication();
    selected.displayLabel = "Amoxicilina 500 mg";
    selected.dosage = "1 comprimido";
    selected.frequency = "cada 8 horas";
    selected.duration = "7 días";
    selected.routeCode = "oral";
    const line = orderLineFromSelectedMedication(selected, "l1", "CL");
    const calc = calculateFromOrderLine(line, "CL");
    assert.equal(calc.status, "deterministic");
    assert.ok((calc.totalQuantity ?? 0) > 0);
  });

  it("round-trips drugPresentationId through order line", () => {
    const selected = emptySelectedMedication();
    selected.displayLabel = "Amoxicilina 500 mg cápsula";
    selected.drugPresentationId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    selected.dosage = "1 cápsula";
    selected.frequency = "c/8 h";
    const line = orderLineFromSelectedMedication(selected, "l1", "CL");
    assert.equal(line.product.drugPresentationId, selected.drugPresentationId);
    const back = selectedMedicationFromOrderLine(line, "CL");
    assert.equal(back.drugPresentationId, selected.drugPresentationId);
    const item = medicationItemFromOrderLine(line, "CL");
    assert.equal(item.drugPresentationId, selected.drugPresentationId);
    assert.equal(item.name, "Amoxicilina 500 mg cápsula");
  });

  it("does not invent drugPresentationId for MANUAL lines", () => {
    const selected = emptySelectedMedication();
    selected.source = "MANUAL";
    selected.displayLabel = "Jarabe de tomillo";
    selected.strengthDisplay = "125 mg/5 ml";
    const line = orderLineFromSelectedMedication(selected, "l1", "CL");
    assert.equal(line.product.source, "MANUAL");
    assert.equal(line.product.drugPresentationId, undefined);
    const item = medicationItemFromOrderLine(line, "CL");
    assert.equal(item.source, "MANUAL");
    assert.equal(item.drugPresentationId, undefined);
    assert.equal(item.concentration, "125 mg/5 ml");
  });
});
