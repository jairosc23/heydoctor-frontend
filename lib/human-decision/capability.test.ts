import test from "node:test";
import assert from "node:assert/strict";
import {
  decisionCapabilityFromPreview,
  isHumanDecisionPreviewEnabled,
} from "./capability";
import type { HumanDecisionPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): HumanDecisionPreviewResponse {
  return {
    data: {
      decisionType: "therapeutic_decision",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        decisionType: "therapeutic_decision",
        title: "Decisión terapéutica",
        supportsPreview: true,
        supportsDecision: true,
        supportsDiagnosis: false,
        supportsGovernance: false,
        supportsAuthorization: false,
        supportsExecution: false,
        supportsEmission: false,
        immutable: true,
        inHumanDecisionScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = decisionCapabilityFromPreview(preview());
  assert.equal(capability.title, "Decisión terapéutica");
  assert.equal(capability.supportsDecision, true);
  assert.equal(capability.supportsGovernance, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsExecution, false);
  assert.equal(capability.supportsEmission, false);
  assert.equal(isHumanDecisionPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = decisionCapabilityFromPreview(
    preview({
      title: "Decisión de estudio",
      decisionType: "investigation_decision",
      supportsPreview: false,
      inHumanDecisionScope: false,
    }),
  );
  assert.equal(blocked.title, "Decisión de estudio");
  assert.equal(isHumanDecisionPreviewEnabled(blocked), false);
});
