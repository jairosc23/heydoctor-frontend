import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CONSULTATION_WORKSPACE_GOVERNANCE } from "./governed-consultation-workspace";
import { mapGovernedConsultationWorkspaceEnvelope } from "./governed-consultation-workspace-mapper";

describe("Phase 23 GovernedConsultationWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedConsultationWorkspaceEnvelope({
      consultationReview: { status: "ok" },
      clinicalEncounter: { status: "ok" },
      governance: { ...GOVERNED_CONSULTATION_WORKSPACE_GOVERNANCE },
      reason: "governed_consultation_workspace_composed_for_physician_review",
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
    assert.equal(mapGovernedConsultationWorkspaceEnvelope(null), null);
  });
});
