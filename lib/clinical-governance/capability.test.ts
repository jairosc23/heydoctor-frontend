import test from "node:test";
import assert from "node:assert/strict";
import {
  governanceCapabilityFromPreview,
  isClinicalGovernancePreviewEnabled,
} from "./capability";
import type { ClinicalGovernancePreviewResponse } from "./types";

function preview(
  capabilityOverrides: Record<string, unknown> = {},
): ClinicalGovernancePreviewResponse {
  return {
    data: {
      governanceType: "therapeutic_governance",
      consultationId: "11111111-1111-4111-8111-111111111111",
      view: {
        ok: false,
        reason: "preview_not_supported",
      },
      gate: { ok: true, issues: [] },
      capability: {
        governanceType: "therapeutic_governance",
        title: "Gobernanza terapéutica",
        supportsPreview: true,
        supportsGovernance: true,
        supportsDiagnosis: false,
        supportsAuthorization: false,
        supportsDisposition: false,
        supportsExecution: false,
        immutable: true,
        inClinicalGovernanceScope: true,
        enabledCountries: "*",
        ...capabilityOverrides,
      },
    },
  };
}

test("capability is a pass-through of the HTTP preview payload", () => {
  const capability = governanceCapabilityFromPreview(preview());
  assert.equal(capability.title, "Gobernanza terapéutica");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsGovernance, true);
  assert.equal(capability.supportsDiagnosis, false);
  assert.equal(capability.supportsAuthorization, false);
  assert.equal(capability.supportsDisposition, false);
  assert.equal(capability.supportsExecution, false);
  assert.equal(capability.immutable, true);
  assert.equal(isClinicalGovernancePreviewEnabled(capability), true);
});

test("frontend does not invent a local catalog when preview disables the type", () => {
  const blocked = governanceCapabilityFromPreview(
    preview({
      title: "Gobernanza de estudio",
      governanceType: "investigation_governance",
      supportsPreview: false,
      inClinicalGovernanceScope: false,
    }),
  );
  assert.equal(blocked.title, "Gobernanza de estudio");
  assert.equal(isClinicalGovernancePreviewEnabled(blocked), false);
});
