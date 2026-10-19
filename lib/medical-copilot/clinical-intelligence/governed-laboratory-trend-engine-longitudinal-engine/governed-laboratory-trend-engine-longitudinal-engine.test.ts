import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedLaboratoryTrendEngineLongitudinalEngineEnvelope } from "./governed-laboratory-trend-engine-longitudinal-engine-mapper";
describe("Laboratory Trend Engine", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedLaboratoryTrendEngineLongitudinalEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Laboratory Trend Engine", applicableCount: 1,
      entries: [{ entryId: "e1", entryTitle: "Entry", domain: "d", topic: "t", summary: "s", explanation: "x", evidenceRefs: [], timelineRole: "r", applicability: "APPLICABLE", confidence: "medium" }],
      enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped); assert.equal(mapped!.usesLlm, false); assert.equal(mapped!.entries.length, 1);
  });
});
