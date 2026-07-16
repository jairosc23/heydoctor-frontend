import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_ENCOUNTER_TIMELINE_GOVERNANCE } from "./governed-encounter-timeline";
import { mapGovernedEncounterTimelineEnvelope } from "./governed-encounter-timeline-mapper";

describe("Phase 43 GovernedEncounterTimeline mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedEncounterTimelineEnvelope({
      clinicalTimeline: { status: "ok" },
      encounterSnapshot: { status: "ok" },
      governance: { ...GOVERNED_ENCOUNTER_TIMELINE_GOVERNANCE },
      reason: "governed_encounter_timeline_composed_for_physician_review",
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
    assert.equal(mapGovernedEncounterTimelineEnvelope(null), null);
  });
});
