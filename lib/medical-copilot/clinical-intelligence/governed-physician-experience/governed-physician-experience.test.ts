import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PHYSICIAN_EXPERIENCE_GOVERNANCE } from "./governed-physician-experience";
import { mapGovernedPhysicianExperienceEnvelope } from "./governed-physician-experience-mapper";

describe("Phase 46 GovernedPhysicianExperience mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPhysicianExperienceEnvelope({
      clinicalExperience: { status: "ok" },
      physicianWorkspace: { status: "ok" },
      governance: { ...GOVERNED_PHYSICIAN_EXPERIENCE_GOVERNANCE },
      reason: "governed_physician_experience_composed_for_physician_review",
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
    assert.equal(mapGovernedPhysicianExperienceEnvelope(null), null);
  });
});
