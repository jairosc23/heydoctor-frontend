import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_READINESS_RUNTIME_GOVERNANCE } from "./governed-persistence-readiness-runtime";
import { mapGovernedPersistenceReadinessRuntimeEnvelope } from "./governed-persistence-readiness-runtime-mapper";

describe("Phase 84 GovernedPersistenceReadinessRuntime mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceReadinessRuntimeEnvelope({
      persistenceReadinessSession: { status: "ok" },
      persistenceRuntime: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_READINESS_RUNTIME_GOVERNANCE },
      reason: "governed_persistence_readiness_runtime_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceReadinessRuntimeEnvelope(null), null);
  });
});
