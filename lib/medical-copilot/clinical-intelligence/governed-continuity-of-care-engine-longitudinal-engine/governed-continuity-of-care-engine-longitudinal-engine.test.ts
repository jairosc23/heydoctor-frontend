import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedContinuityOfCareEngineLongitudinalEngineEnvelope } from "./governed-continuity-of-care-engine-longitudinal-engine-mapper";
describe("Continuity of Care Engine", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedContinuityOfCareEngineLongitudinalEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Continuity of Care Engine", applicableCount: 1,
      entries: [{ entryId: "e1", entryTitle: "Entry", domain: "d", topic: "t", summary: "s", explanation: "x", evidenceRefs: [], timelineRole: "r", applicability: "APPLICABLE", confidence: "medium" }],
      enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped); assert.equal(mapped!.usesLlm, false); assert.equal(mapped!.entries.length, 1);
  });
});
