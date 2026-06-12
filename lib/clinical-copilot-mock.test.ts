import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildCopilotContextFromEncounter,
  COPILOT_GOVERNANCE_LINES,
  MOCK_COPILOT_ACTIONS,
  MOCK_COPILOT_INSIGHTS,
} from "./clinical-copilot-mock";

describe("clinical-copilot-mock", () => {
  it("construye contexto visual desde datos del encuentro sin APIs", () => {
    const context = buildCopilotContextFromEncounter({
      diagnosis: "E11.9",
      diagnosisDescription: "Diabetes mellitus tipo 2",
      treatment: "Control metabólico y dieta",
      notes: "Paciente refiere adherencia parcial a tratamiento farmacológico.",
      patientName: "María Pérez",
    });

    assert.equal(context.activeDiagnosis, "Diabetes mellitus tipo 2");
    assert.ok(context.soapSummary.plan.includes("Control metabólico"));
    assert.ok(context.sources.includes("soap"));
    assert.ok(context.sources.includes("timeline"));
    assert.equal(context.recentTimeline.length, 3);
    assert.equal(context.pendingLabs.length, 2);
  });

  it("expone insights y acciones mock para foundation UX", () => {
    assert.equal(MOCK_COPILOT_INSIGHTS.length, 4);
    assert.equal(MOCK_COPILOT_ACTIONS.length, 4);
    assert.equal(COPILOT_GOVERNANCE_LINES.length, 4);
    assert.match(COPILOT_GOVERNANCE_LINES[0]!, /informativa/);
  });
});
