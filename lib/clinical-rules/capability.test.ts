import test from "node:test";
import assert from "node:assert/strict";
import {
  isClinicalRulePreviewEnabled,
  ruleCapabilityFromPreview,
} from "./capability";
import type { ClinicalRuleEvaluationPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalRuleEvaluationPreviewResponse {
  return {
    data: {
      ruleType: "medication_rule",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        ruleType: "medication_rule",
        title: "Regla de medicación",
        supportsPreview: true,
        supportsEvaluation: true,
        supportsExplanation: false,
        supportsExecution: false,
        immutable: true,
        inClinicalRulesScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = ruleCapabilityFromPreview(preview());
  assert.equal(capability.title, "Regla de medicación");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsEvaluation, true);
  assert.equal(capability.supportsExplanation, false);
  assert.equal(capability.supportsExecution, false);
  assert.equal(capability.immutable, true);
  assert.equal(isClinicalRulePreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = ruleCapabilityFromPreview(
    preview({
      title: "Regla de alergia",
      ruleType: "allergy_rule",
      supportsPreview: false,
      inClinicalRulesScope: false,
    }),
  );
  assert.equal(blocked.title, "Regla de alergia");
  assert.equal(isClinicalRulePreviewEnabled(blocked), false);
});
