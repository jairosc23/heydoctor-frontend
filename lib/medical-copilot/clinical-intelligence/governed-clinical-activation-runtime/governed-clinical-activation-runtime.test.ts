import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ACTIVATION_RUNTIME_GOVERNANCE } from "./governed-clinical-activation-runtime";
import { mapGovernedClinicalActivationRuntimeEnvelope } from "./governed-clinical-activation-runtime-mapper";

describe("Phase 67 GovernedClinicalActivationRuntime mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalActivationRuntimeEnvelope({
      activationSession: { status: "ok" },
      clinicalExperiencePackage: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_ACTIVATION_RUNTIME_GOVERNANCE },
      reason: "governed_clinical_activation_runtime_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalActivationRuntimeEnvelope(null), null);
  });
});
