import test from "node:test";
import assert from "node:assert/strict";
import {
  isLongitudinalPreviewEnabled,
  recordCapabilityFromPreview,
} from "./capability";
import type { LongitudinalClinicalRecordPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): LongitudinalClinicalRecordPreviewResponse {
  return {
    data: {
      recordType: "documents",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        recordType: "documents",
        title: "Registro longitudinal de documentos",
        supportsPreview: true,
        supportsLongitudinalView: true,
        supportsHistoryNavigation: true,
        supportsTimeline: false,
        immutable: true,
        inLongitudinalScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = recordCapabilityFromPreview(preview());
  assert.equal(capability.title, "Registro longitudinal de documentos");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsLongitudinalView, true);
  assert.equal(capability.supportsTimeline, false);
  assert.equal(capability.immutable, true);
  assert.equal(isLongitudinalPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = recordCapabilityFromPreview(
    preview({
      title: "Registro longitudinal de encuentros",
      recordType: "encounters",
      supportsPreview: false,
      inLongitudinalScope: false,
    }),
  );
  assert.equal(blocked.title, "Registro longitudinal de encuentros");
  assert.equal(isLongitudinalPreviewEnabled(blocked), false);
});
