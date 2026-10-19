import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ACTIVATION_WORKSPACE_GOVERNANCE } from "./governed-clinical-activation-workspace";
import { mapGovernedClinicalActivationWorkspaceEnvelope } from "./governed-clinical-activation-workspace-mapper";

describe("Phase 59 GovernedClinicalActivationWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalActivationWorkspaceEnvelope({
      physicianRuntimePackage: { status: "ok" },
      clinicalExperiencePackage: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_ACTIVATION_WORKSPACE_GOVERNANCE },
      reason: "governed_clinical_activation_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalActivationWorkspaceEnvelope(null), null);
  });
});
