import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ACTIVATION_TIMELINE_GOVERNANCE } from "./governed-clinical-activation-timeline";
import { mapGovernedClinicalActivationTimelineEnvelope } from "./governed-clinical-activation-timeline-mapper";

describe("Phase 61 GovernedClinicalActivationTimeline mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalActivationTimelineEnvelope({
      activationReview: { status: "ok" },
      clinicalTimeline: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_ACTIVATION_TIMELINE_GOVERNANCE },
      reason: "governed_clinical_activation_timeline_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalActivationTimelineEnvelope(null), null);
  });
});
