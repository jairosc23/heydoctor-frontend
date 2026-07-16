import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE } from "./governed-pediatric-safety-engine";
import { mapGovernedPediatricSafetyEngineEnvelope } from "./governed-pediatric-safety-engine-mapper";
describe("GovernedPediatricSafetyEngine mapper", () => {
  it("maps HITL specialty engine surface without write flags", () => {
    const mapped = mapGovernedPediatricSafetyEngineEnvelope({
      status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
      title: "Governed Pediatric Safety Engine",
      kind: "specialty_engine",
      items: [{ id: "1", label: "slot", approved: false, persisted: false, executable: false, automaticDecision: false }],
      governance: { ...GOVERNED_SPECIALIZED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE },
      reason: "proposed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.repositoryInvoked, false);
    assert.equal(mapped.executesAction, false);
    assert.equal(mapped.draftApproved, false);
    assert.equal(mapped.automaticDecision, false);
    assert.ok(mapped.components.some((c) => c.key === "hitl" && c.present));
    assert.equal(mapGovernedPediatricSafetyEngineEnvelope(null), null);
  });
});
