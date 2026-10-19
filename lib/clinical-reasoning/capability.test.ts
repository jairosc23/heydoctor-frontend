import test from "node:test";
import assert from "node:assert/strict";
import {
  isClinicalReasoningPreviewEnabled,
  reasoningCapabilityFromPreview,
} from "./capability";
import type { ClinicalReasoningPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalReasoningPreviewResponse {
  return {
    data: {
      reasoningType: "hypothesis_reasoning",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        reasoningType: "hypothesis_reasoning",
        title: "Razonamiento de hipótesis",
        supportsPreview: true,
        supportsReasoning: true,
        supportsDiagnosis: false,
        supportsRecommendation: false,
        immutable: true,
        inClinicalReasoningScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = reasoningCapabilityFromPreview(preview());
  assert.equal(capability.title, "Razonamiento de hipótesis");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsReasoning, true);
  assert.equal(capability.supportsDiagnosis, false);
  assert.equal(capability.supportsRecommendation, false);
  assert.equal(capability.immutable, true);
  assert.equal(isClinicalReasoningPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = reasoningCapabilityFromPreview(
    preview({
      title: "Razonamiento de evidencia",
      reasoningType: "evidence_reasoning",
      supportsPreview: false,
      inClinicalReasoningScope: false,
    }),
  );
  assert.equal(blocked.title, "Razonamiento de evidencia");
  assert.equal(isClinicalReasoningPreviewEnabled(blocked), false);
});
