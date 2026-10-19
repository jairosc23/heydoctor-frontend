import test from "node:test";
import assert from "node:assert/strict";
import {
  isOrderPreviewEnabled,
  orderCapabilityFromPreview,
} from "./capability";
import type { ClinicalOrderPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalOrderPreviewResponse {
  return {
    data: {
      type: "prescription",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        type: "prescription",
        title: "Receta médica",
        supportsPreview: true,
        supportsIssue: true,
        supportsDispatch: false,
        supportsDocument: true,
        canBelongToOrderSet: true,
        requiresHitl: true,
        requiresPersistedSource: true,
        inClinicalEngineScope: true,
        enabledCountries: "*",
        rxForbiddenInE08: true,
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = orderCapabilityFromPreview(preview());
  assert.equal(capability.title, "Receta médica");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsIssue, true);
  assert.equal(capability.supportsDispatch, false);
  assert.equal(capability.requiresHitl, true);
  assert.equal(capability.rxForbiddenInE08, true);
  assert.equal(isOrderPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = orderCapabilityFromPreview(
    preview({
      title: "Orden de laboratorio",
      type: "laboratory",
      supportsPreview: false,
      inClinicalEngineScope: false,
    }),
  );
  assert.equal(blocked.title, "Orden de laboratorio");
  assert.equal(isOrderPreviewEnabled(blocked), false);
});
