import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DIAGNOSTIC_GAP_ANALYZER_GOVERNANCE, type DiagnosticGapAnalyzerResult } from "./diagnostic-gap-analyzer";
import { mapDiagnosticGapAnalyzerResult, mapDiagnosticGapAnalyzerResultEnvelope } from "./diagnostic-gap-analyzer-mapper";

describe("AI-27 DiagnosticGapAnalyzerResult mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: DiagnosticGapAnalyzerResult = {
      gapAnalyzerId: "id1",
      providerId: "openai",
      gapSlots: [],
      governance: { ...DIAGNOSTIC_GAP_ANALYZER_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        evidenceWorkspaceId: "x",
        missingInformationId: "x",
        contextId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapDiagnosticGapAnalyzerResultEnvelope({
      gapAnalyzer: {
        source: "diagnostic_gap_analyzer",
        builderVersion: "1.0.0",
        gapAnalyzer: model,
        governance: { ...DIAGNOSTIC_GAP_ANALYZER_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapDiagnosticGapAnalyzerResult(null), null);
  });
});
