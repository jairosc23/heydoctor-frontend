import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedSideEffectSurveillanceTherapeuticEngineEnvelope } from "./governed-side-effect-surveillance-therapeutic-engine-mapper";
describe("Side Effect Surveillance", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedSideEffectSurveillanceTherapeuticEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Side Effect Surveillance", applicableCount: 1,
      entries: [{ entryId: "e1", entryTitle: "Entry", domain: "d", topic: "t", summary: "s", explanation: "x", evidenceRefs: [], therapeuticRole: "r", applicability: "APPLICABLE", confidence: "medium" }],
      enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped); assert.equal(mapped!.usesLlm, false); assert.equal(mapped!.entries.length, 1);
  });
});
