import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedClinicalDecisionSystemPackageEnvelope } from "./governed-clinical-decision-system-package-mapper";
describe("Clinical Decision Package", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedClinicalDecisionSystemPackageEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Clinical Decision Package", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "governed_clinical_decision_system_package", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], decisionRole: "runtime", applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});
