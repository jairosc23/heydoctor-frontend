import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedClinicalInterventionPlanningTherapeuticEngineEnvelope } from "./governed-clinical-intervention-planning-therapeutic-engine-mapper";
describe("Clinical Intervention Planning", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedClinicalInterventionPlanningTherapeuticEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Clinical Intervention Planning", applicableCount: 1,
      entries: [{ entryId: "e1", entryTitle: "Entry", domain: "d", topic: "t", summary: "s", explanation: "x", evidenceRefs: [], therapeuticRole: "r", applicability: "APPLICABLE", confidence: "medium" }],
      enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped); assert.equal(mapped!.usesLlm, false); assert.equal(mapped!.entries.length, 1);
  });
});
