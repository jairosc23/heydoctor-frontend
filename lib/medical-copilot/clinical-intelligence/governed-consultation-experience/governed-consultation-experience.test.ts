import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CONSULTATION_EXPERIENCE_GOVERNANCE } from "./governed-consultation-experience";
import { mapGovernedConsultationExperienceEnvelope } from "./governed-consultation-experience-mapper";

describe("Phase 47 GovernedConsultationExperience mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedConsultationExperienceEnvelope({
      physicianExperience: { status: "ok" },
      consultationPackage: { status: "ok" },
      governance: { ...GOVERNED_CONSULTATION_EXPERIENCE_GOVERNANCE },
      reason: "governed_consultation_experience_composed_for_physician_review",
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
    assert.equal(mapGovernedConsultationExperienceEnvelope(null), null);
  });
});
