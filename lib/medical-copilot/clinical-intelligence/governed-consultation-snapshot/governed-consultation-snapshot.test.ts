import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CONSULTATION_SNAPSHOT_GOVERNANCE } from "./governed-consultation-snapshot";
import { mapGovernedConsultationSnapshotEnvelope } from "./governed-consultation-snapshot-mapper";

describe("Phase 21 GovernedConsultationSnapshot mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedConsultationSnapshotEnvelope({
      consultationRuntime: { status: "ok" },
      clinicalContext: { status: "ok" },
      clinicalPlan: { status: "ok" },
      reviewSession: { status: "ok" },
      governance: { ...GOVERNED_CONSULTATION_SNAPSHOT_GOVERNANCE },
      reason: "governed_consultation_snapshot_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 4);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedConsultationSnapshotEnvelope(null), null);
  });
});
