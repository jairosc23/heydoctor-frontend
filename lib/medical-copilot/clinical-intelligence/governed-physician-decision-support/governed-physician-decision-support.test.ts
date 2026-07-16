import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_EVIDENCE_UI_GOVERNANCE } from "./governed-physician-decision-support";
import { mapGovernedPhysicianDecisionSupportEnvelope } from "./governed-physician-decision-support-mapper";

describe("GovernedPhysicianDecisionSupport mapper", () => {
  it("maps HITL evidence surface without write flags", () => {
    const mapped = mapGovernedPhysicianDecisionSupportEnvelope({
      status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
      title: "Governed Physician Decision Support",
      kind: "evidence",
      items: [{ id: "1", label: "slot", approved: false, persisted: false, executable: false, automaticDecision: false }],
      governance: { ...GOVERNED_CLINICAL_EVIDENCE_UI_GOVERNANCE },
      reason: "proposed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.repositoryInvoked, false);
    assert.equal(mapped.executesAction, false);
    assert.equal(mapped.draftApproved, false);
    assert.equal(mapped.automaticDecision, false);
    assert.ok(mapped.components.some((c) => c.key === "hitl" && c.present));
    assert.equal(mapGovernedPhysicianDecisionSupportEnvelope(null), null);
  });
});
