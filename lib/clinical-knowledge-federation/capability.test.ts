import test from "node:test";
import assert from "node:assert/strict";
import {
  knowledgeFederationCapabilityFromPreview,
  isClinicalKnowledgeFederationPreviewEnabled,
} from "./capability";
import type { ClinicalKnowledgeFederationPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalKnowledgeFederationPreviewResponse {
  return {
    data: {
      federationType: "federable_standing",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        federationType: "federable_standing",
        title: "Federación compartible",
        supportsPreview: true,
        supportsFederation: true,
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
        inClinicalKnowledgeFederationScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = knowledgeFederationCapabilityFromPreview(preview());
  assert.equal(capability.title, "Federación compartible");
  assert.equal(capability.supportsFederation, true);
  assert.equal(capability.supportsScientificGovernance, false);
  assert.equal(capability.supportsKnowledge, false);
  assert.equal(capability.supportsEvidence, false);
  assert.equal(capability.supportsGovernance, false);
  assert.equal(capability.supportsLearning, false);
  assert.equal(capability.supportsDecision, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsExecution, false);
  assert.equal(capability.supportsEmission, false);
  assert.equal(isClinicalKnowledgeFederationPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = knowledgeFederationCapabilityFromPreview(
    preview({
      title: "Federación retenida",
      federationType: "retained_standing",
      supportsPreview: false,
      inClinicalKnowledgeFederationScope: false,
    }),
  );
  assert.equal(blocked.title, "Federación retenida");
  assert.equal(isClinicalKnowledgeFederationPreviewEnabled(blocked), false);
});
