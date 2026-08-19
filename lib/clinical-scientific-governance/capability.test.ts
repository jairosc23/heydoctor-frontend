import test from "node:test";
import assert from "node:assert/strict";
import {
  scientificGovernanceCapabilityFromPreview,
  isClinicalScientificGovernancePreviewEnabled,
} from "./capability";
import type { ClinicalScientificGovernancePreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalScientificGovernancePreviewResponse {
  return {
    data: {
      scientificType: "provenance_standing",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        scientificType: "provenance_standing",
        title: "Gobernanza de procedencia",
        supportsPreview: true,
        supportsScientificGovernance: true,
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
        inClinicalScientificGovernanceScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = scientificGovernanceCapabilityFromPreview(preview());
  assert.equal(capability.title, "Gobernanza de procedencia");
  assert.equal(capability.supportsScientificGovernance, true);
  assert.equal(capability.supportsKnowledge, false);
  assert.equal(capability.supportsEvidence, false);
  assert.equal(capability.supportsGovernance, false);
  assert.equal(capability.supportsLearning, false);
  assert.equal(capability.supportsDecision, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsExecution, false);
  assert.equal(capability.supportsEmission, false);
  assert.equal(isClinicalScientificGovernancePreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = scientificGovernanceCapabilityFromPreview(
    preview({
      title: "Gobernanza de conflicto",
      scientificType: "conflict_standing",
      supportsPreview: false,
      inClinicalScientificGovernanceScope: false,
    }),
  );
  assert.equal(blocked.title, "Gobernanza de conflicto");
  assert.equal(isClinicalScientificGovernancePreviewEnabled(blocked), false);
});
