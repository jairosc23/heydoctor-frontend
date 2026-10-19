import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MEDICAL_COPILOT_API_VERSION, MEDICAL_COPILOT_GOVERNANCE } from "../types";
import { buildGovernedAnalysisRequest } from "./integration";
import { mapGovernedAnalysisToSuggestions } from "./to-suggestions";
import {
  CLINICAL_INTELLIGENCE_ADAPTER_VERSION,
  type ClinicalAnalysisResponse,
} from "./types";

function sampleAnalysis(
  overrides: Partial<ClinicalAnalysisResponse> = {},
): ClinicalAnalysisResponse {
  return {
    analysisId: "cia_1",
    session: {
      sessionId: "sess_1",
      consultationId: "cons_1",
      patientId: "pat_1",
      status: "active",
    },
    status: "completed",
    findings: [
      {
        findingId: "finding_action_act_1",
        kind: "action",
        title: "suggest_labs",
        summary: "Considerar laboratorios",
        sourceId: "act_1",
        requiresPhysicianReview: true,
      },
      {
        findingId: "finding_timeline_te_1",
        kind: "timeline",
        title: "session_created",
        summary: "Sesión creada",
        sourceId: "te_1",
        requiresPhysicianReview: true,
      },
    ],
    actions: [
      {
        actionId: "act_1",
        actionType: "suggest_labs",
        status: "created",
        summary: "Considerar laboratorios",
        priority: "high",
        requiresPhysicianApproval: true,
        skillId: "skill_labs",
        artifactId: null,
      },
    ],
    workspaceArtifactCount: 1,
    timelineEntryCount: 1,
    memoryEntryCount: 0,
    governance: {
      ...MEDICAL_COPILOT_GOVERNANCE,
      source: "medical_copilot_facade",
      adapterVersion: CLINICAL_INTELLIGENCE_ADAPTER_VERSION,
    },
    reason: null,
    generatedAt: "2026-07-08T12:00:00.000Z",
    facadeStatuses: {
      session: "ok",
      workspace: "ok",
      timeline: "ok",
      memory: "ok",
      actions: "ok",
    },
    ...overrides,
  };
}

describe("CP-34 governed integration helpers", () => {
  it("buildGovernedAnalysisRequest reutiliza session y dictado opaco", () => {
    const request = buildGovernedAnalysisRequest({
      consultationId: "cons_1",
      patientId: "pat_1",
      sessionId: "sess_1",
      dictationDraft: "  paciente con cefalea  ",
    });

    assert.equal(request.consultationId, "cons_1");
    assert.equal(request.patientId, "pat_1");
    assert.equal(request.sessionId, "sess_1");
    assert.equal(request.contextNote, "paciente con cefalea");
  });

  it("mapGovernedAnalysisToSuggestions mantiene HITL y no auto-aplica", () => {
    const suggestions = mapGovernedAnalysisToSuggestions(sampleAnalysis());

    assert.ok(suggestions.length >= 2);
    assert.ok(
      suggestions.every((s) => s.requiresPhysicianReview === true),
    );
    assert.ok(suggestions.every((s) => s.autoAppliesToDictation === false));
    assert.ok(suggestions.every((s) => s.type === "manual_review"));
    assert.ok(
      suggestions.some((s) => s.suggestionId === "governed_action_act_1"),
    );
    assert.ok(
      !suggestions.some(
        (s) => s.suggestionId === "governed_finding_action_act_1",
      ),
    );
    assert.equal(
      suggestions.find((s) => s.suggestionId === "governed_action_act_1")
        ?.severity,
      "review",
    );
  });

  it("preserva governance markers del análisis", () => {
    const analysis = sampleAnalysis();
    assert.equal(analysis.governance.requiresPhysicianReview, true);
    assert.equal(analysis.governance.executesAction, false);
    assert.equal(analysis.governance.autoPersistedToEmr, false);
    assert.equal(analysis.governance.source, "medical_copilot_facade");
    assert.equal(MEDICAL_COPILOT_API_VERSION, "v1");
  });
});
