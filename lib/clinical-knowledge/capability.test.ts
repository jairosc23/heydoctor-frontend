import test from "node:test";
import assert from "node:assert/strict";
import {
  knowledgeCapabilityFromPreview,
  isClinicalKnowledgePreviewEnabled,
} from "./capability";
import type { ClinicalKnowledgePreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalKnowledgePreviewResponse {
  return {
    data: {
      knowledgeType: "protocol_knowledge",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        knowledgeType: "protocol_knowledge",
        title: "Conocimiento de protocolo",
        supportsPreview: true,
        supportsKnowledge: true,
        supportsLearning: false,
        supportsReentry: false,
        supportsDiagnosis: false,
        supportsDecision: false,
        supportsGovernance: false,
        supportsAuthorization: false,
        supportsExecution: false,
        supportsEmission: false,
        immutable: true,
        inClinicalKnowledgeScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = knowledgeCapabilityFromPreview(preview());
  assert.equal(capability.title, "Conocimiento de protocolo");
  assert.equal(capability.supportsKnowledge, true);
  assert.equal(capability.supportsLearning, false);
  assert.equal(capability.supportsReentry, false);
  assert.equal(capability.supportsDecision, false);
  assert.equal(capability.supportsGovernance, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsExecution, false);
  assert.equal(capability.supportsEmission, false);
  assert.equal(isClinicalKnowledgePreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = knowledgeCapabilityFromPreview(
    preview({
      title: "Conocimiento relacional",
      knowledgeType: "relational_knowledge",
      supportsPreview: false,
      inClinicalKnowledgeScope: false,
    }),
  );
  assert.equal(blocked.title, "Conocimiento relacional");
  assert.equal(isClinicalKnowledgePreviewEnabled(blocked), false);
});
