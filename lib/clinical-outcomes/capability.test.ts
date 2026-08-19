import test from "node:test";
import assert from "node:assert/strict";
import {
  isClinicalOutcomePreviewEnabled,
  outcomeCapabilityFromPreview,
} from "./capability";
import type { ClinicalOutcomePreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalOutcomePreviewResponse {
  return {
    data: {
      outcomeType: "therapeutic_outcome",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        outcomeType: "therapeutic_outcome",
        title: "Resultado terapéutico",
        supportsPreview: true,
        supportsOutcome: true,
        supportsDiagnosis: false,
        supportsAuthorization: false,
        supportsLearning: false,
        immutable: true,
        inClinicalOutcomesScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = outcomeCapabilityFromPreview(preview());
  assert.equal(capability.title, "Resultado terapéutico");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsOutcome, true);
  assert.equal(capability.supportsDiagnosis, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsLearning, false);
  assert.equal(capability.immutable, true);
  assert.equal(isClinicalOutcomePreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = outcomeCapabilityFromPreview(
    preview({
      title: "Resultado de estudio",
      outcomeType: "investigation_outcome",
      supportsPreview: false,
      inClinicalOutcomesScope: false,
    }),
  );
  assert.equal(blocked.title, "Resultado de estudio");
  assert.equal(isClinicalOutcomePreviewEnabled(blocked), false);
});
