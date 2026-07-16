import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_PREVIEW_GOVERNANCE } from "./governed-persistence-preview";
import { mapGovernedPersistencePreviewEnvelope } from "./governed-persistence-preview-mapper";

describe("Phase 76 GovernedPersistencePreview mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistencePreviewEnvelope({
      persistenceRuntime: { status: "ok" },
      clinicalActivationPackage: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_PREVIEW_GOVERNANCE },
      reason: "governed_persistence_preview_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistencePreviewEnvelope(null), null);
  });
});
