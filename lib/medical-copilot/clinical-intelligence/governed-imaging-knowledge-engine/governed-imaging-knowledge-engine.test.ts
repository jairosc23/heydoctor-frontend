import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedImagingKnowledgeEngineEnvelope } from "./governed-imaging-knowledge-engine-mapper";

describe("Imaging Knowledge Engine", () => {
  it("maps envelope with knowledge entries and HITL seals", () => {
    const mapped = mapGovernedImagingKnowledgeEngineEnvelope({
      status: "ok",
      data: {
        status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
        title: "Imaging Knowledge Engine",
        applicableCount: 1,
        entries: [{
          entryId: "e1",
          entryTitle: "Entry",
          domain: "imaging",
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
