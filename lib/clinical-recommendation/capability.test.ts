import test from "node:test";
import assert from "node:assert/strict";
import {
  isClinicalRecommendationPreviewEnabled,
  recommendationCapabilityFromPreview,
} from "./capability";
import type { ClinicalRecommendationPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalRecommendationPreviewResponse {
  return {
    data: {
      recommendationType: "therapeutic_recommendation",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        recommendationType: "therapeutic_recommendation",
        title: "Recomendación terapéutica",
        supportsPreview: true,
        supportsRecommendation: true,
        supportsDiagnosis: false,
        supportsAuthorization: false,
        supportsDisposition: false,
        immutable: true,
        inClinicalRecommendationScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = recommendationCapabilityFromPreview(preview());
  assert.equal(capability.title, "Recomendación terapéutica");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsRecommendation, true);
  assert.equal(capability.supportsDiagnosis, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsDisposition, false);
  assert.equal(capability.immutable, true);
  assert.equal(isClinicalRecommendationPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = recommendationCapabilityFromPreview(
    preview({
      title: "Recomendación de estudio",
      recommendationType: "investigation_recommendation",
      supportsPreview: false,
      inClinicalRecommendationScope: false,
    }),
  );
  assert.equal(blocked.title, "Recomendación de estudio");
  assert.equal(isClinicalRecommendationPreviewEnabled(blocked), false);
});
