import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedDiagnosticCorrelationDiagnosticIntelEngineEnvelope } from "./governed-diagnostic-correlation-diagnostic-intel-engine-mapper";
describe("Diagnostic Correlation", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedDiagnosticCorrelationDiagnosticIntelEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Diagnostic Correlation", applicableCount: 1,
      entries: [{ entryId: "e1", entryTitle: "Entry", domain: "d", topic: "t", summary: "s", explanation: "x", evidenceRefs: [], diagnosticRole: "r", applicability: "APPLICABLE", confidence: "medium" }],
      enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped); assert.equal(mapped!.usesLlm, false); assert.equal(mapped!.entries.length, 1);
  });
});
