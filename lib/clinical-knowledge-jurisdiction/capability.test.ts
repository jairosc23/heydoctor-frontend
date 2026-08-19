import test from "node:test";
import assert from "node:assert/strict";
import {
  knowledgeJurisdictionCapabilityFromPreview,
  isClinicalKnowledgeJurisdictionPreviewEnabled,
} from "./capability";
import type { ClinicalKnowledgeJurisdictionPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalKnowledgeJurisdictionPreviewResponse {
  return {
    data: {
      jurisdictionType: "in_force_standing",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        jurisdictionType: "in_force_standing",
        title: "Vigencia jurisdiccional",
        supportsPreview: true,
        supportsJurisdiction: true,
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
        inClinicalKnowledgeJurisdictionScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = knowledgeJurisdictionCapabilityFromPreview(preview());
  assert.equal(capability.title, "Vigencia jurisdiccional");
  assert.equal(capability.supportsJurisdiction, true);
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
  assert.equal(isClinicalKnowledgeJurisdictionPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = knowledgeJurisdictionCapabilityFromPreview(
    preview({
      title: "Vigencia retenida",
      jurisdictionType: "withheld_standing",
      supportsPreview: false,
      inClinicalKnowledgeJurisdictionScope: false,
    }),
  );
  assert.equal(blocked.title, "Vigencia retenida");
  assert.equal(isClinicalKnowledgeJurisdictionPreviewEnabled(blocked), false);
});
