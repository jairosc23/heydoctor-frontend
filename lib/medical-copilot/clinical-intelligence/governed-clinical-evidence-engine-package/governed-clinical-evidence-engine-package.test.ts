import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedClinicalEvidenceEnginePackageEnvelope } from "./governed-clinical-evidence-engine-package-mapper";

describe("Clinical Evidence Package", () => {
  it("maps envelope with evidence entries and HITL seals", () => {
    const mapped = mapGovernedClinicalEvidenceEnginePackageEnvelope({
      status: "ok",
      data: {
        status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
        title: "Clinical Evidence Package",
        applicableCount: 1,
        entries: [{
          entryId: "e1",
          entryTitle: "Entry",
          domain: "clinical_evidence_engine_package",
          topic: "t",
          summary: "s",
          explanation: "x",
          evidenceRefs: ["medical_copilot_session"],
          evidenceLevel: "guideline",
          applicability: "APPLICABLE",
          confidence: "medium",
        }],
        enginesPresent: ["evidence_source_engine"],
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
