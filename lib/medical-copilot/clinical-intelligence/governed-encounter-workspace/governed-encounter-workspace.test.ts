import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_ENCOUNTER_WORKSPACE_GOVERNANCE } from "./governed-encounter-workspace";
import { mapGovernedEncounterWorkspaceEnvelope } from "./governed-encounter-workspace-mapper";

describe("Phase 24 GovernedEncounterWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedEncounterWorkspaceEnvelope({
      consultationWorkspace: { status: "ok" },
      documentationPackage: { status: "ok" },
      governance: { ...GOVERNED_ENCOUNTER_WORKSPACE_GOVERNANCE },
      reason: "governed_encounter_workspace_composed_for_physician_review",
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
    assert.equal(mapGovernedEncounterWorkspaceEnvelope(null), null);
  });
});
