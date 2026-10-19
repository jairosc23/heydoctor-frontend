import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_TIMELINE_GOVERNANCE } from "./governed-clinical-timeline";
import { mapGovernedClinicalTimelineEnvelope } from "./governed-clinical-timeline-mapper";

describe("Phase 42 GovernedClinicalTimeline mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalTimelineEnvelope({
      consultationHome: { status: "ok" },
      clinicalOverview: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_TIMELINE_GOVERNANCE },
      reason: "governed_clinical_timeline_composed_for_physician_review",
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
    assert.equal(mapGovernedClinicalTimelineEnvelope(null), null);
  });
});
