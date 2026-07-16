import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedAscoGuidelineEngineEnvelope } from "./governed-asco-guideline-engine-mapper";

describe("ASCO Guideline Engine", () => {
  it("maps envelope with guideline entries and HITL seals", () => {
    const mapped = mapGovernedAscoGuidelineEngineEnvelope({
      status: "ok",
      data: {
        status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
        title: "ASCO Guideline Engine",
        applicableCount: 1,
        entries: [{
          entryId: "e1", entryTitle: "Entry", domain: "asco_guideline", topic: "t",
          summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"],
          guidelineBody: "ADA", applicability: "APPLICABLE", confidence: "medium",
        }],
        enginesPresent: [],
        governance: { requiresPhysicianReview: true, usesLlm: false },
      },
    });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});
