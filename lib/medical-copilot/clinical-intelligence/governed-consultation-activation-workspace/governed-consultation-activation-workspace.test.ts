import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CONSULTATION_ACTIVATION_WORKSPACE_GOVERNANCE } from "./governed-consultation-activation-workspace";
import { mapGovernedConsultationActivationWorkspaceEnvelope } from "./governed-consultation-activation-workspace-mapper";

describe("Phase 64 GovernedConsultationActivationWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedConsultationActivationWorkspaceEnvelope({
      physicianActivationWorkspace: { status: "ok" },
      consultationPackage: { status: "ok" },
      governance: { ...GOVERNED_CONSULTATION_ACTIVATION_WORKSPACE_GOVERNANCE },
      reason: "governed_consultation_activation_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedConsultationActivationWorkspaceEnvelope(null), null);
  });
});
