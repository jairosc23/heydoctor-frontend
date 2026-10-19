import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_TIMELINE_GOVERNANCE } from "./governed-persistence-timeline";
import { mapGovernedPersistenceTimelineEnvelope } from "./governed-persistence-timeline-mapper";

describe("Phase 71 GovernedPersistenceTimeline mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceTimelineEnvelope({
      persistenceReview: { status: "ok" },
      clinicalActivationTimeline: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_TIMELINE_GOVERNANCE },
      reason: "governed_persistence_timeline_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceTimelineEnvelope(null), null);
  });
});
