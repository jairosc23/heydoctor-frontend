import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_ENCOUNTER_SNAPSHOT_GOVERNANCE } from "./governed-encounter-snapshot";
import { mapGovernedEncounterSnapshotEnvelope } from "./governed-encounter-snapshot-mapper";

describe("Phase 26 GovernedEncounterSnapshot mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedEncounterSnapshotEnvelope({
      encounterReview: { status: "ok" },
      clinicalEncounter: { status: "ok" },
      governance: { ...GOVERNED_ENCOUNTER_SNAPSHOT_GOVERNANCE },
      reason: "governed_encounter_snapshot_composed_for_physician_review",
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
    assert.equal(mapGovernedEncounterSnapshotEnvelope(null), null);
  });
});
