import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedPopulationDashboardPopulationEngineEnvelope } from "./governed-population-dashboard-population-engine-mapper";
describe("Population Dashboard", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedPopulationDashboardPopulationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Population Dashboard", applicableCount: 1,
      entries: [{ entryId: "e1", entryTitle: "Entry", domain: "d", topic: "t", summary: "s", explanation: "x", evidenceRefs: [], populationRole: "r", applicability: "APPLICABLE", confidence: "medium" }],
      enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped); assert.equal(mapped!.usesLlm, false); assert.equal(mapped!.entries.length, 1);
  });
});
