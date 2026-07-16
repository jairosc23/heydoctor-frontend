import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_WORKSPACE_GOVERNANCE } from "./governed-clinical-workspace";
import { mapGovernedClinicalWorkspaceEnvelope } from "./governed-clinical-workspace-mapper";

describe("Phase 29 GovernedClinicalWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalWorkspaceEnvelope({
      consultationPackage: { status: "ok" },
      clinicalEncounter: { status: "ok" },
      documentationPackage: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_WORKSPACE_GOVERNANCE },
      reason: "governed_clinical_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 3);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedClinicalWorkspaceEnvelope(null), null);
  });
});
