import test from "node:test";
import assert from "node:assert/strict";
import {
  decisionCapabilityFromPreview,
  isDecisionPreviewEnabled,
} from "./capability";
import type { ClinicalDecisionPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalDecisionPreviewResponse {
  return {
    data: {
      type: "allergy_conflict",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        type: "allergy_conflict",
        title: "Conflicto de alergia",
        supportsPreview: true,
        supportsAcknowledge: true,
        supportsOverride: true,
        evaluatesRules: false,
        aiForbidden: true,
        requiresHitl: true,
        requiresSourceRef: true,
        canBelongToDecisionSet: true,
        inClinicalEngineScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = decisionCapabilityFromPreview(preview());
  assert.equal(capability.title, "Conflicto de alergia");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsAcknowledge, true);
  assert.equal(capability.supportsOverride, true);
  assert.equal(capability.evaluatesRules, false);
  assert.equal(capability.aiForbidden, true);
  assert.equal(capability.requiresHitl, true);
  assert.equal(isDecisionPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = decisionCapabilityFromPreview(
    preview({
      title: "Recordatorio de guía",
      type: "guideline_reminder",
      supportsPreview: false,
      inClinicalEngineScope: false,
    }),
  );
  assert.equal(blocked.title, "Recordatorio de guía");
  assert.equal(isDecisionPreviewEnabled(blocked), false);
});
