import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CONSULTATION_PACKAGE_GOVERNANCE } from "./governed-consultation-package";
import { mapGovernedConsultationPackageEnvelope } from "./governed-consultation-package-mapper";

describe("Phase 28 GovernedConsultationPackage mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedConsultationPackageEnvelope({
      encounterConsolidation: { status: "ok" },
      clinicalEncounter: { status: "ok" },
      documentationPackage: { status: "ok" },
      clinicalAssistance: { status: "ok" },
      intelligenceRuntime: { status: "ok" },
      governance: { ...GOVERNED_CONSULTATION_PACKAGE_GOVERNANCE },
      reason: "governed_consultation_package_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 5);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedConsultationPackageEnvelope(null), null);
  });
});
