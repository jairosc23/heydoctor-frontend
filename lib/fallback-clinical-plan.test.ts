import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFallbackUnifiedPlan,
  isSupportedFallbackDiagnosisCode,
} from "./fallback-clinical-plan";
import { unifiedPlanHasActions } from "./unified-clinical-plan";

describe("fallback-clinical-plan", () => {
  it("genera plan I10 con educación, labs y seguimiento sin medicamentos", () => {
    const plan = buildFallbackUnifiedPlan({
      code: "I10",
      description: "Hipertensión esencial",
    });
    assert.ok(plan);
    assert.equal(plan!.medications.length, 0);
    assert.ok(plan!.education.length >= 1);
    assert.ok(plan!.labs.length >= 1);
    assert.ok(plan!.followUp.length >= 1);
    assert.equal(plan!.source, "fallback_plan");
    assert.ok(unifiedPlanHasActions(plan!));
  });

  it("reconoce diagnósticos frecuentes soportados", () => {
    assert.ok(isSupportedFallbackDiagnosisCode("I10"));
    assert.ok(isSupportedFallbackDiagnosisCode("E11.9"));
    assert.ok(isSupportedFallbackDiagnosisCode("J44.9"));
    assert.ok(isSupportedFallbackDiagnosisCode("M54.5"));
  });

  it("genera plan genérico para códigos no mapeados", () => {
    const plan = buildFallbackUnifiedPlan({
      code: "Z00.0",
      description: "Examen general",
    });
    assert.ok(plan);
    assert.ok(unifiedPlanHasActions(plan!));
    assert.equal(plan!.medications.length, 0);
  });

  it("retorna null sin código", () => {
    assert.equal(buildFallbackUnifiedPlan({ code: "" }), null);
  });
});
