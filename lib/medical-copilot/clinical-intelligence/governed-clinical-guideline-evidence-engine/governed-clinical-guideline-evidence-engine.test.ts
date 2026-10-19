import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedClinicalGuidelineEvidenceEngineEnvelope } from "./governed-clinical-guideline-evidence-engine-mapper";

describe("Clinical Guideline Evidence Engine", () => {
  it("maps envelope with evidence entries and HITL seals", () => {
    const mapped = mapGovernedClinicalGuidelineEvidenceEngineEnvelope({
      status: "ok",
      data: {
        status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
        title: "Clinical Guideline Evidence Engine",
        applicableCount: 1,
        entries: [{
          entryId: "e1",
          entryTitle: "Entry",
          domain: "clinical_guideline_evidence",
          topic: "t",
          summary: "s",
          explanation: "x",
          evidenceRefs: ["medical_copilot_session"],
          evidenceLevel: "guideline",
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
