import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedRareDiseaseAwarenessDiagnosticIntelEngineEnvelope } from "./governed-rare-disease-awareness-diagnostic-intel-engine-mapper";
describe("Rare Disease Awareness", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedRareDiseaseAwarenessDiagnosticIntelEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Rare Disease Awareness", applicableCount: 1,
      entries: [{ entryId: "e1", entryTitle: "Entry", domain: "d", topic: "t", summary: "s", explanation: "x", evidenceRefs: [], diagnosticRole: "r", applicability: "APPLICABLE", confidence: "medium" }],
      enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped); assert.equal(mapped!.usesLlm, false); assert.equal(mapped!.entries.length, 1);
  });
});
