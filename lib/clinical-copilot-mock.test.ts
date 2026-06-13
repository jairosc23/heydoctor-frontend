import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildCopilotContextFromEncounter,
  COPILOT_GOVERNANCE_LINES,
  MOCK_COPILOT_ACTIONS,
  MOCK_COPILOT_INSIGHTS,
} from "./clinical-copilot-mock";

describe("clinical-copilot-mock", () => {
  it("construye contexto v2 desde datos del encuentro sin memoria", () => {
    const context = buildCopilotContextFromEncounter({
      diagnosis: "E11.9",
      diagnosisDescription: "Diabetes mellitus tipo 2",
      chiefComplaint: "Control glucémico",
      treatment: "Control metabólico y dieta",
      notes: "Paciente refiere adherencia parcial a tratamiento farmacológico.",
      patientName: "María Pérez",
    });

    assert.equal(context.activeDiagnosis, "Diabetes mellitus tipo 2");
    assert.ok(context.soapSummary.plan.includes("Control metabólico"));
    assert.ok(context.sources.includes("soap"));
    assert.ok(context.sources.includes("patient-snapshot"));
    assert.equal(context.recentTimeline.length, 0);
    assert.equal(context.pendingLabs.length, 0);
  });

  it("expone governance y acciones UI; insights mock vacíos (Phase 4.6)", () => {
    assert.equal(MOCK_COPILOT_INSIGHTS.length, 0);
    assert.equal(MOCK_COPILOT_ACTIONS.length, 4);
    assert.equal(COPILOT_GOVERNANCE_LINES.length, 4);
    assert.match(COPILOT_GOVERNANCE_LINES[0]!, /informativa/);
  });
});
