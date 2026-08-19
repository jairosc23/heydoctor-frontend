import test from "node:test";
import assert from "node:assert/strict";
import {
  evidenceCapabilityFromPreview,
  isClinicalEvidencePreviewEnabled,
} from "./capability";
import type { ClinicalEvidencePreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalEvidencePreviewResponse {
  return {
    data: {
      evidenceType: "supporting_evidence",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        evidenceType: "supporting_evidence",
        title: "Evidencia de apoyo",
        supportsPreview: true,
        supportsEvidence: true,
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
        inClinicalEvidenceScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = evidenceCapabilityFromPreview(preview());
  assert.equal(capability.title, "Evidencia de apoyo");
  assert.equal(capability.supportsEvidence, true);
  assert.equal(capability.supportsKnowledge, false);
  assert.equal(capability.supportsLearning, false);
  assert.equal(capability.supportsReentry, false);
  assert.equal(capability.supportsDecision, false);
  assert.equal(capability.supportsGovernance, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsExecution, false);
  assert.equal(capability.supportsEmission, false);
  assert.equal(isClinicalEvidencePreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = evidenceCapabilityFromPreview(
    preview({
      title: "Evidencia de contradicción",
      evidenceType: "contradicting_evidence",
      supportsPreview: false,
      inClinicalEvidenceScope: false,
    }),
  );
  assert.equal(blocked.title, "Evidencia de contradicción");
  assert.equal(isClinicalEvidencePreviewEnabled(blocked), false);
});
