import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedAhaGuidelineEngineEnvelope } from "./governed-aha-guideline-engine-mapper";

describe("AHA Guideline Engine", () => {
  it("maps envelope with guideline entries and HITL seals", () => {
    const mapped = mapGovernedAhaGuidelineEngineEnvelope({
      status: "ok",
      data: {
        status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
        title: "AHA Guideline Engine",
        applicableCount: 1,
        entries: [{
          entryId: "e1", entryTitle: "Entry", domain: "aha_guideline", topic: "t",
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
