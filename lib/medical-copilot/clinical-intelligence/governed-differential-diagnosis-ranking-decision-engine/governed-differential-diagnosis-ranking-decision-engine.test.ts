import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedDifferentialDiagnosisRankingEngineEnvelope } from "./governed-differential-diagnosis-ranking-decision-engine-mapper";
describe("Differential Diagnosis Ranking Engine", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedDifferentialDiagnosisRankingEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Differential Diagnosis Ranking Engine", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "differential_diagnosis_ranking", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], decisionRole: "runtime", applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});
