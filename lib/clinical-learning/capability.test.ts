import test from "node:test";
import assert from "node:assert/strict";
import {
  learningCapabilityFromPreview,
  isClinicalLearningPreviewEnabled,
} from "./capability";
import type { ClinicalLearningPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalLearningPreviewResponse {
  return {
    data: {
      learningType: "therapeutic_learning",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        learningType: "therapeutic_learning",
        title: "Aprendizaje terapéutico",
        supportsPreview: true,
        supportsLearning: true,
        supportsDiagnosis: false,
        supportsDecision: false,
        supportsGovernance: false,
        supportsAuthorization: false,
        supportsExecution: false,
        supportsEmission: false,
        immutable: true,
        inClinicalLearningScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = learningCapabilityFromPreview(preview());
  assert.equal(capability.title, "Aprendizaje terapéutico");
  assert.equal(capability.supportsLearning, true);
  assert.equal(capability.supportsDecision, false);
  assert.equal(capability.supportsGovernance, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsExecution, false);
  assert.equal(capability.supportsEmission, false);
  assert.equal(isClinicalLearningPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = learningCapabilityFromPreview(
    preview({
      title: "Aprendizaje de estudio",
      learningType: "investigation_learning",
      supportsPreview: false,
      inClinicalLearningScope: false,
    }),
  );
  assert.equal(blocked.title, "Aprendizaje de estudio");
  assert.equal(isClinicalLearningPreviewEnabled(blocked), false);
});
