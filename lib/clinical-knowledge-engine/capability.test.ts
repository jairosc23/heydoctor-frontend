import test from "node:test";
import assert from "node:assert/strict";
import {
  knowledgeEngineCapabilityFromPreview,
  isClinicalKnowledgeEnginePreviewEnabled,
} from "./capability";
import type { ClinicalKnowledgeEnginePreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalKnowledgeEnginePreviewResponse {
  return {
    data: {
      adviseType: "eligible_advice",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        adviseType: "eligible_advice",
        title: "Consejo elegible",
        supportsPreview: true,
        supportsAdvise: true,
    supportsJurisdiction: false,
    supportsFederation: false,
    supportsScientificGovernance: false,
        supportsEvidence: false,
        supportsKnowledge: false,
        supportsLearning: false,
        supportsReentry: false,
        supportsDiagnosis: false,
        supportsDecision: false,
        supportsGovernance: false,
        supportsAuthorization: false,
        supportsExecution: false,
        supportsEmission: false,
        immutable: true,
        inClinicalKnowledgeEngineScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = knowledgeEngineCapabilityFromPreview(preview());
  assert.equal(capability.title, "Consejo elegible");
  assert.equal(capability.supportsAdvise, true);
  assert.equal(capability.supportsJurisdiction, false);
  assert.equal(capability.supportsFederation, false);
  assert.equal(capability.supportsScientificGovernance, false);
  assert.equal(capability.supportsKnowledge, false);
  assert.equal(capability.supportsEvidence, false);
  assert.equal(capability.supportsGovernance, false);
  assert.equal(capability.supportsLearning, false);
  assert.equal(capability.supportsDecision, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsExecution, false);
  assert.equal(capability.supportsEmission, false);
  assert.equal(isClinicalKnowledgeEnginePreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = knowledgeEngineCapabilityFromPreview(
    preview({
      title: "Consejo retenido",
      adviseType: "withheld_advice",
      supportsPreview: false,
      inClinicalKnowledgeEngineScope: false,
    }),
  );
  assert.equal(blocked.title, "Consejo retenido");
  assert.equal(isClinicalKnowledgeEnginePreviewEnabled(blocked), false);
});
