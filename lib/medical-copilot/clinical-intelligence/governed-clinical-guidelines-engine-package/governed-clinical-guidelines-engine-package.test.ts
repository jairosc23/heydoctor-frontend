import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedClinicalGuidelinesEnginePackageEnvelope } from "./governed-clinical-guidelines-engine-package-mapper";

describe("Clinical Guidelines Package", () => {
  it("maps envelope with guideline entries and HITL seals", () => {
    const mapped = mapGovernedClinicalGuidelinesEnginePackageEnvelope({
      status: "ok",
      data: {
        status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
        title: "Clinical Guidelines Package",
        applicableCount: 1,
        entries: [{
          entryId: "e1", entryTitle: "Entry", domain: "clinical_guidelines_engine_package", topic: "t",
          summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"],
          guidelineBody: "ADA", applicability: "APPLICABLE", confidence: "medium",
        }],
        enginesPresent: ["guideline_runtime_engine"],
        governance: { requiresPhysicianReview: true, usesLlm: false },
      },
    });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});
