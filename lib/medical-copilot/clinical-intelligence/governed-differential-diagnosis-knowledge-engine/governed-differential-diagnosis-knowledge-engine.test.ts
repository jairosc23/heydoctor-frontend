import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedDifferentialDiagnosisKnowledgeEngineEnvelope } from "./governed-differential-diagnosis-knowledge-engine-mapper";

describe("Differential Diagnosis Knowledge Engine", () => {
  it("maps envelope with knowledge entries and HITL seals", () => {
    const mapped = mapGovernedDifferentialDiagnosisKnowledgeEngineEnvelope({
      status: "ok",
      data: {
        status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
        title: "Differential Diagnosis Knowledge Engine",
        applicableCount: 1,
        entries: [{
          entryId: "e1",
          entryTitle: "Entry",
          domain: "differential_diagnosis",
          topic: "t",
          summary: "s",
          explanation: "x",
          evidenceRefs: ["medical_copilot_session"],
          applicability: "APPLICABLE",
          confidence: "medium",
        }],
        enginesPresent: [],
        governance: { requiresPhysicianReview: true, usesLlm: false },
      },
    });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
    assert.equal(mapped!.applicableCount, 1);
  });
});
