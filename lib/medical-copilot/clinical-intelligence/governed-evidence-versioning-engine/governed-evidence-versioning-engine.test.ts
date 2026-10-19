import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedEvidenceVersioningEngineEnvelope } from "./governed-evidence-versioning-engine-mapper";

describe("Evidence Versioning Engine", () => {
  it("maps envelope with evidence entries and HITL seals", () => {
    const mapped = mapGovernedEvidenceVersioningEngineEnvelope({
      status: "ok",
      data: {
        status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
        title: "Evidence Versioning Engine",
        applicableCount: 1,
        entries: [{
          entryId: "e1",
          entryTitle: "Entry",
          domain: "evidence_versioning",
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
