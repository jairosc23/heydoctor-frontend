import test from "node:test";
import assert from "node:assert/strict";
import {
  reentryCapabilityFromPreview,
  isClinicalReentryPreviewEnabled,
} from "./capability";
import type { ClinicalReentryPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalReentryPreviewResponse {
  return {
    data: {
      reentryType: "therapeutic_reentry",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        reentryType: "therapeutic_reentry",
        title: "Reingreso terapéutico",
        supportsPreview: true,
        supportsReentry: true,
        supportsLearning: false,
        supportsDiagnosis: false,
        supportsDecision: false,
        supportsGovernance: false,
        supportsAuthorization: false,
        supportsExecution: false,
        supportsEmission: false,
        immutable: true,
        inClinicalReentryScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = reentryCapabilityFromPreview(preview());
  assert.equal(capability.title, "Reingreso terapéutico");
  assert.equal(capability.supportsReentry, true);
  assert.equal(capability.supportsLearning, false);
  assert.equal(capability.supportsDecision, false);
  assert.equal(capability.supportsGovernance, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsExecution, false);
  assert.equal(capability.supportsEmission, false);
  assert.equal(isClinicalReentryPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = reentryCapabilityFromPreview(
    preview({
      title: "Reingreso de estudio",
      reentryType: "investigation_reentry",
      supportsPreview: false,
      inClinicalReentryScope: false,
    }),
  );
  assert.equal(blocked.title, "Reingreso de estudio");
  assert.equal(isClinicalReentryPreviewEnabled(blocked), false);
});
