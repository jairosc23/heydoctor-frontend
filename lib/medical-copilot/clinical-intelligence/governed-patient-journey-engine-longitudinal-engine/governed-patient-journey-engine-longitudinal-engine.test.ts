import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedPatientJourneyEngineLongitudinalEngineEnvelope } from "./governed-patient-journey-engine-longitudinal-engine-mapper";
describe("Patient Journey Engine", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedPatientJourneyEngineLongitudinalEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Patient Journey Engine", applicableCount: 1,
      entries: [{ entryId: "e1", entryTitle: "Entry", domain: "d", topic: "t", summary: "s", explanation: "x", evidenceRefs: [], timelineRole: "r", applicability: "APPLICABLE", confidence: "medium" }],
      enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped); assert.equal(mapped!.usesLlm, false); assert.equal(mapped!.entries.length, 1);
  });
});
