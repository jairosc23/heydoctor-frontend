import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_READINESS_TIMELINE_GOVERNANCE } from "./governed-persistence-readiness-timeline";
import { mapGovernedPersistenceReadinessTimelineEnvelope } from "./governed-persistence-readiness-timeline-mapper";

describe("Phase 81 GovernedPersistenceReadinessTimeline mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceReadinessTimelineEnvelope({
      persistenceReadinessReview: { status: "ok" },
      persistenceTimeline: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_READINESS_TIMELINE_GOVERNANCE },
      reason: "governed_persistence_readiness_timeline_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceReadinessTimelineEnvelope(null), null);
  });
});
