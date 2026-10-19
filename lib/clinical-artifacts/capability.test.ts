import test from "node:test";
import assert from "node:assert/strict";
import {
  artifactCapabilityFromPreview,
  isArtifactPreviewEnabled,
} from "./capability";
import type { ClinicalArtifactPreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalArtifactPreviewResponse {
  return {
    data: {
      artifactType: "encounter_close",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        artifactType: "encounter_close",
        title: "Artefacto de cierre de encuentro",
        supportsPreview: true,
        supportsHistory: true,
        supportsTraceability: true,
        supportsRelationship: true,
        immutable: true,
        inRegistryScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = artifactCapabilityFromPreview(preview());
  assert.equal(capability.title, "Artefacto de cierre de encuentro");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsHistory, true);
  assert.equal(capability.immutable, true);
  assert.equal(isArtifactPreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = artifactCapabilityFromPreview(
    preview({
      title: "Artefacto de documento clinico",
      artifactType: "clinical_document",
      supportsPreview: false,
      inRegistryScope: false,
    }),
  );
  assert.equal(blocked.title, "Artefacto de documento clinico");
  assert.equal(isArtifactPreviewEnabled(blocked), false);
});
