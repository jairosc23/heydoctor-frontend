import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_PLANNING_GOVERNANCE,
  type ClinicalPlan,
} from "./clinical-planning";
import {
  mapClinicalPlan,
  mapClinicalPlanEnvelope,
} from "./clinical-planning-mapper";

describe("CI-10 Clinical Planning mapper", () => {
  it("maps engine envelope and preserves HITL governance", () => {
    const plan: ClinicalPlan = {
      contextId: "case-rep-1",
      planItems: [
        {
          id: "plan-1",
          kind: "to_review",
          order: 1,
          layer: "findings",
          sourceContextItemId: "ctx-1",
          summary: "Finding one",
        },
        {
          id: "plan-2",
          kind: "missing",
          order: 2,
          layer: "insights",
          sourceContextItemId: null,
          summary: "Missing structural information: insights",
        },
      ],
      governance: { ...CLINICAL_PLANNING_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        snapshotId: "snap-1",
        reviewId: "rev-1",
        generatedAt: "2026-07-12T00:00:00.000Z",
        engineVersion: "1.0.0",
        status: "partial",
        itemCount: 2,
        toReviewCount: 1,
        pendingCount: 0,
        availableCount: 0,
        missingCount: 1,
      },
    };

    const mapped = mapClinicalPlanEnvelope({
      plan: {
        source: "clinical_planning_engine",
        engineVersion: "1.0.0",
        plan,
        governance: { ...CLINICAL_PLANNING_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.plan.contextId, "case-rep-1");
    assert.equal(mapped.plan.planItems.length, 2);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid plan payloads", () => {
    assert.equal(mapClinicalPlan(null), null);
    assert.equal(mapClinicalPlan({ contextId: "x" }), null);
  });
});
