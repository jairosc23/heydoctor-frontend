import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapGovernedClinicalRiskRuleEngineEnvelope } from "./governed-clinical-risk-rule-engine-mapper";
describe("GovernedClinicalRiskRuleEngine mapper", () => {
  it("maps deterministic rule evaluations with explainability fields", () => {
    const mapped = mapGovernedClinicalRiskRuleEngineEnvelope({
      status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
      title: "Governed Clinical Risk Rule Engine",
      triggeredCount: 1,
      evaluations: [{
        ruleId: "risk_geriatric_age",
        ruleName: "Geriatric age band",
        condition: "IF ageYears ≥ 65 THEN geriatric risk flag",
        result: "TRIGGERED",
        explanation: "Age 70 ≥ 65",
        evidenceUsed: ["ageYears:70"],
        confidence: "high",
        priority: "high",
      }],
      governance: { requiresPhysicianReview: true, executesAction: false, autoPersistedToEmr: false, draftApproved: false, writesEmr: false, repositoryInvoked: false, automaticDecision: false, usesLlm: false },
      reason: "ok",
    });
    assert.ok(mapped);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.usesLlm, false);
    assert.equal(mapped.evaluations.length, 1);
    assert.equal(mapped.evaluations[0].ruleId, "risk_geriatric_age");
    assert.match(mapped.evaluations[0].condition, /ageYears/);
    assert.equal(mapGovernedClinicalRiskRuleEngineEnvelope(null), null);
  });
});
