import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CONSULTATION_RUNTIME_GOVERNANCE } from "./governed-consultation-runtime";
import { mapGovernedConsultationRuntimeEnvelope } from "./governed-consultation-runtime-mapper";

describe("Phase 20 GovernedConsultationRuntime mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedConsultationRuntimeEnvelope({
      clinicalEncounter: { status: "ok" },
      physicianWorkspace: { status: "ok" },
      documentationPackage: { status: "ok" },
      governance: { ...GOVERNED_CONSULTATION_RUNTIME_GOVERNANCE },
      reason: "governed_consultation_runtime_composed_for_physician_review",
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
    assert.equal(mapGovernedConsultationRuntimeEnvelope(null), null);
  });
});
