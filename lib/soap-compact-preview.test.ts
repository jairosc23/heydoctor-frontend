import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  firstLineOrFallback,
  formatDiagnosisPreview,
  formatPlanPreviewCounts,
} from "./soap-compact-preview";

describe("soap-compact-preview", () => {
  it("formatea diagnóstico con código y descripción", () => {
    assert.equal(
      formatDiagnosisPreview({ code: "I10", description: "Hipertensión esencial" }),
      "I10 — Hipertensión esencial",
    );
  });

  it("extrae primera línea de notas o fallback", () => {
    assert.equal(firstLineOrFallback("  \nEvolución favorable\nPlan…", "Sin notas"), "Evolución favorable");
    assert.equal(firstLineOrFallback("", "Sin notas"), "Sin notas");
  });

  it("resume conteos del plan clínico", () => {
    assert.equal(
      formatPlanPreviewCounts({
        actionCount: 2,
        labCount: 1,
        recommendationCount: 3,
        hasDiagnosis: true,
      }),
      "2 acciones · 1 laboratorio · 3 recomendaciones",
    );
  });
});
