import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  emptyPosology,
  formatPosologyPreviewText,
  frequencySpecFromCode,
  durationSpecFromCode,
  getCatalog,
  renderPosologyBlocks,
} from "./index";

describe("Medication Domain P0 — PosologyRenderer (ADR-020)", () => {
  it("exposes catalogs for CL, CO, US, ES", () => {
    for (const j of ["CL", "CO", "US", "ES"] as const) {
      const cat = getCatalog(j);
      assert.equal(cat.jurisdictionCode, j);
      assert.ok(cat.frequencies.length > 0);
      assert.ok(cat.durations.length > 0);
      assert.ok(cat.routes.length > 0);
    }
    assert.equal(getCatalog("US").locale, "en");
    assert.equal(getCatalog("CL").locale, "es");
  });

  it("renders semantic blocks without comma-joining dose and frequency", () => {
    const posology = emptyPosology();
    posology.dose = { amount: 1, unit: "tablet" };
    posology.frequency = frequencySpecFromCode("EVERY_8_HOURS");
    posology.duration = durationSpecFromCode("DAYS_7");
    posology.route = "oral";

    const blocks = renderPosologyBlocks({
      product: {
        displayLabel: "Paracetamol 500 mg",
        doseForm: "tablet",
        strengthDisplay: "500 mg",
        jurisdictionCode: "CL",
      },
      posology,
      jurisdictionCode: "CL",
    });

    const keys = blocks.map((b) => b.key);
    assert.ok(keys.includes("medication"));
    assert.ok(keys.includes("dose"));
    assert.ok(keys.includes("frequency"));
    assert.ok(keys.includes("duration"));
    assert.ok(keys.includes("route"));

    const text = formatPosologyPreviewText({
      product: { displayLabel: "Paracetamol 500 mg", jurisdictionCode: "CL" },
      posology,
      jurisdictionCode: "CL",
    });

    assert.equal(text.includes("1, 8"), false);
    assert.equal(text.includes("1,8"), false);
    assert.ok(text.includes("Dosis:"));
    assert.ok(text.includes("Frecuencia:"));
    assert.ok(text.includes("Cada 8 horas"));
  });

  it("keeps dose and frequency as separate block values", () => {
    const posology = emptyPosology();
    posology.dose = { amount: 1, unit: "tablet" };
    posology.frequency = frequencySpecFromCode("EVERY_8_HOURS");
    const blocks = renderPosologyBlocks({
      product: { displayLabel: "Paracetamol 500 mg" },
      posology,
      jurisdictionCode: "CL",
    });
    const dose = blocks.find((b) => b.key === "dose");
    const freq = blocks.find((b) => b.key === "frequency");
    assert.ok(dose);
    assert.ok(freq);
    assert.notEqual(dose!.value, `${dose!.value}, ${freq!.value}`);
    assert.equal(freq!.value.includes("8"), true);
    assert.equal(dose!.value.startsWith("1"), true);
  });
});
