import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_ENCOUNTER_CONSOLIDATION_GOVERNANCE } from "./governed-encounter-consolidation";
import { mapGovernedEncounterConsolidationEnvelope } from "./governed-encounter-consolidation-mapper";

describe("Phase 27 GovernedEncounterConsolidation mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedEncounterConsolidationEnvelope({
      encounterSnapshot: { status: "ok" },
      documentationPackage: { status: "ok" },
      physicianWorkspace: { status: "ok" },
      governance: { ...GOVERNED_ENCOUNTER_CONSOLIDATION_GOVERNANCE },
      reason: "governed_encounter_consolidation_composed_for_physician_review",
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
    assert.equal(mapGovernedEncounterConsolidationEnvelope(null), null);
  });
});
