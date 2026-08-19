import test from "node:test";
import assert from "node:assert/strict";
import {
  authorityCapabilityFromPreview,
  isAuthorityPreviewEnabled,
} from "./capability";
import type { ClinicalAuthorityPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalAuthorityPreviewResponse {
  return {
    data: {
      actClass: "encounter_close",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        actClass: "encounter_close",
        title: "Acto de cierre de encuentro",
        supportsPreview: true,
        supportsConfirm: true,
        supportsAuthorize: true,
        supportsEmission: false,
        requiresHitl: true,
        requiresPhysician: true,
        inAuthoritySpineScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = authorityCapabilityFromPreview(preview());
  assert.equal(capability.title, "Acto de cierre de encuentro");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsConfirm, true);
  assert.equal(capability.supportsAuthorize, true);
  assert.equal(capability.supportsEmission, false);
  assert.equal(capability.requiresHitl, true);
  assert.equal(isAuthorityPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the class", () => {
  const blocked = authorityCapabilityFromPreview(
    preview({
      title: "Acto de medicación",
      actClass: "medication",
      supportsPreview: false,
      inAuthoritySpineScope: false,
    }),
  );
  assert.equal(blocked.title, "Acto de medicación");
  assert.equal(isAuthorityPreviewEnabled(blocked), false);
});
