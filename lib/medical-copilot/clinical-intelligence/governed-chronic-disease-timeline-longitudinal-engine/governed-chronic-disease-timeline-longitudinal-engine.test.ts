import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedChronicDiseaseTimelineLongitudinalEngineEnvelope } from "./governed-chronic-disease-timeline-longitudinal-engine-mapper";
describe("Chronic Disease Timeline", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedChronicDiseaseTimelineLongitudinalEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Chronic Disease Timeline", applicableCount: 1,
      entries: [{ entryId: "e1", entryTitle: "Entry", domain: "d", topic: "t", summary: "s", explanation: "x", evidenceRefs: [], timelineRole: "r", applicability: "APPLICABLE", confidence: "medium" }],
      enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped); assert.equal(mapped!.usesLlm, false); assert.equal(mapped!.entries.length, 1);
  });
});
