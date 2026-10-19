import test from "node:test";
import assert from "node:assert/strict";
import {
  isClinicalUnderstandingPreviewEnabled,
  understandingCapabilityFromPreview,
} from "./capability";
import type { ClinicalUnderstandingPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalUnderstandingPreviewResponse {
  return {
    data: {
      understandingType: "situation_understanding",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        understandingType: "situation_understanding",
        title: "Comprensión de situación",
        supportsPreview: true,
        supportsAssembly: true,
        supportsDiagnosis: false,
        supportsReasoning: false,
        immutable: true,
        inClinicalUnderstandingScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = understandingCapabilityFromPreview(preview());
  assert.equal(capability.title, "Comprensión de situación");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsAssembly, true);
  assert.equal(capability.supportsDiagnosis, false);
  assert.equal(capability.supportsReasoning, false);
  assert.equal(capability.immutable, true);
  assert.equal(isClinicalUnderstandingPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = understandingCapabilityFromPreview(
    preview({
      title: "Comprensión de problemas",
      understandingType: "problem_understanding",
      supportsPreview: false,
      inClinicalUnderstandingScope: false,
    }),
  );
  assert.equal(blocked.title, "Comprensión de problemas");
  assert.equal(isClinicalUnderstandingPreviewEnabled(blocked), false);
});
