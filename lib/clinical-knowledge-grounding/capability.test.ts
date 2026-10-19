import test from "node:test";
import assert from "node:assert/strict";
import {
  knowledgeGroundingCapabilityFromPreview,
  isClinicalKnowledgeGroundingPreviewEnabled,
} from "./capability";
import type { ClinicalKnowledgeGroundingPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalKnowledgeGroundingPreviewResponse {
  return {
    data: {
      groundingType: "grounded_attribution",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        groundingType: "grounded_attribution",
        title: "Atribución trazable",
        supportsPreview: true,
        supportsGrounding: true,
    supportsAdvise: false,
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
        inClinicalKnowledgeGroundingScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = knowledgeGroundingCapabilityFromPreview(preview());
  assert.equal(capability.title, "Atribución trazable");
  assert.equal(capability.supportsGrounding, true);
  assert.equal(capability.supportsAdvise, false);
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
  assert.equal(isClinicalKnowledgeGroundingPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = knowledgeGroundingCapabilityFromPreview(
    preview({
      title: "Atribución retenida",
      groundingType: "withheld_attribution",
      supportsPreview: false,
      inClinicalKnowledgeGroundingScope: false,
    }),
  );
  assert.equal(blocked.title, "Atribución retenida");
  assert.equal(isClinicalKnowledgeGroundingPreviewEnabled(blocked), false);
});
