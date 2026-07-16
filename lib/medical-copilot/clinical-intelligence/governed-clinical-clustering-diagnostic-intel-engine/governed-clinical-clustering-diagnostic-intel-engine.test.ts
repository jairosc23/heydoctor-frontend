import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedClinicalClusteringDiagnosticIntelEngineEnvelope } from "./governed-clinical-clustering-diagnostic-intel-engine-mapper";
describe("Clinical Clustering", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedClinicalClusteringDiagnosticIntelEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Clinical Clustering", applicableCount: 1,
      entries: [{ entryId: "e1", entryTitle: "Entry", domain: "d", topic: "t", summary: "s", explanation: "x", evidenceRefs: [], diagnosticRole: "r", applicability: "APPLICABLE", confidence: "medium" }],
      enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped); assert.equal(mapped!.usesLlm, false); assert.equal(mapped!.entries.length, 1);
  });
});
