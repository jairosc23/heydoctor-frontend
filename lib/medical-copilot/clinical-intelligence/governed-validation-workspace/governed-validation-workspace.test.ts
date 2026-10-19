import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_VALIDATION_WORKSPACE_GOVERNANCE } from "./governed-validation-workspace";
import { mapGovernedValidationWorkspaceEnvelope } from "./governed-validation-workspace-mapper";

describe("Phase 52 GovernedValidationWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedValidationWorkspaceEnvelope({
      draftComparison: { status: "ok" },
      reviewSession: { status: "ok" },
      governance: { ...GOVERNED_VALIDATION_WORKSPACE_GOVERNANCE },
      reason: "governed_validation_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedValidationWorkspaceEnvelope(null), null);
  });
});
