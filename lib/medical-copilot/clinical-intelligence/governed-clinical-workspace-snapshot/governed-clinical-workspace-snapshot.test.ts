import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_WORKSPACE_SNAPSHOT_GOVERNANCE } from "./governed-clinical-workspace-snapshot";
import { mapGovernedClinicalWorkspaceSnapshotEnvelope } from "./governed-clinical-workspace-snapshot-mapper";

describe("Phase 31 GovernedClinicalWorkspaceSnapshot mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalWorkspaceSnapshotEnvelope({
      clinicalWorkspaceReview: { status: "ok" },
      consultationSnapshot: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_WORKSPACE_SNAPSHOT_GOVERNANCE },
      reason: "governed_clinical_workspace_snapshot_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 2);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedClinicalWorkspaceSnapshotEnvelope(null), null);
  });
});
