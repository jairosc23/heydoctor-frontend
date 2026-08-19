import test from "node:test";
import assert from "node:assert/strict";
import {
  executionCapabilityFromPreview,
  isClinicalExecutionPreviewEnabled,
} from "./capability";
import type { ClinicalExecutionPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalExecutionPreviewResponse {
  return {
    data: {
      executionType: "therapeutic_execution",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: { ok: false, reason: "preview_not_supported" },
      gate: { ok: true, issues: [] },
      capability: {
        executionType: "therapeutic_execution",
        title: "Ejecución terapéutica",
        supportsPreview: true,
        supportsExecution: true,
        supportsDiagnosis: false,
        supportsDecision: false,
        supportsGovernance: false,
        supportsAuthorization: false,
        supportsEmission: false,
        immutable: true,
        inClinicalExecutionScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = executionCapabilityFromPreview(preview());
  assert.equal(capability.title, "Ejecución terapéutica");
  assert.equal(capability.supportsExecution, true);
  assert.equal(capability.supportsDecision, false);
  assert.equal(capability.supportsGovernance, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsEmission, false);
  assert.equal(isClinicalExecutionPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = executionCapabilityFromPreview(
    preview({
      title: "Ejecución de estudio",
      executionType: "investigation_execution",
      supportsPreview: false,
      inClinicalExecutionScope: false,
    }),
  );
  assert.equal(blocked.title, "Ejecución de estudio");
  assert.equal(isClinicalExecutionPreviewEnabled(blocked), false);
});
