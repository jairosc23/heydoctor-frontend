import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  VALIDATION_SCENARIOS,
  auditScenarioContext,
  runClinicalValidationBattery,
  validateScenario,
} from "./clinical-ai-validation";

describe("clinical-ai-validation Phase 4.5.1", () => {
  it("ejecuta batería de 5 escenarios clínicos", () => {
    const battery = runClinicalValidationBattery();
    assert.equal(battery.scenarios.length, 5);
    assert.equal(battery.recommendations.length, 10);
    assert.ok(battery.aggregateComposite >= 6);
    assert.ok(battery.aggregateComposite <= 10);
  });

  it("Caso 1 I10 — contexto HTA en prompt", () => {
    const fixture = VALIDATION_SCENARIOS[0]!;
    const audit = auditScenarioContext(fixture);
    const result = validateScenario(fixture);

    assert.equal(fixture.code, "I10");
    assert.ok(audit.sentToAssist.diagnosis);
    assert.ok(audit.sentToAssist.medications);
    assert.ok(audit.sentToAssist.alerts);
    assert.ok(result.scores.composite >= 6);
    assert.match(result.aiResultSummary, /cobertura contexto/);
  });

  it("Caso 2 E11 — HbA1c y medicación en contexto", () => {
    const fixture = VALIDATION_SCENARIOS[1]!;
    const audit = auditScenarioContext(fixture);

    assert.ok(audit.sentToAssist.labs);
    assert.ok(audit.sentToAssist.medications);
    assert.ok(audit.missingFromPrompt.includes("draftNotes"));
  });

  it("Caso 3 J45 — asma con plan ambulatorio", () => {
    const fixture = VALIDATION_SCENARIOS[2]!;
    const result = validateScenario(fixture);

    assert.equal(fixture.code, "J45");
    assert.ok(result.scores.soapGenerated >= 7);
    assert.ok(result.gaps.some((g) => g.field.includes("Timeline")));
  });

  it("Caso 4 M54.5 — memoria escasa detecta gaps", () => {
    const fixture = VALIDATION_SCENARIOS[3]!;
    const audit = auditScenarioContext(fixture);

    assert.equal(fixture.memory.activeConditions.length, 0);
    assert.equal(audit.sentToAssist.medications, false);
    assert.equal(audit.sentToAssist.clinicalMemory, false);
  });

  it("Caso 5 K21.9 — ERGE con medicación activa", () => {
    const fixture = VALIDATION_SCENARIOS[4]!;
    const audit = auditScenarioContext(fixture);

    assert.ok(audit.sentToAssist.medications);
    assert.ok(audit.sentToAssist.diagnosis);
  });

  it("todos los escenarios documentan examen físico como gap", () => {
    const battery = runClinicalValidationBattery();
    for (const s of battery.scenarios) {
      assert.ok(
        s.gaps.some((g) => g.field.includes("Examen físico")),
        `${s.id} debe listar gap de examen físico`,
      );
    }
  });

  it("fallback summary no recibe demografía (backend gap)", () => {
    const battery = runClinicalValidationBattery();
    for (const s of battery.scenarios) {
      assert.equal(s.contextAudit.syncedToDb.age, false);
      assert.equal(s.contextAudit.syncedToDb.sex, false);
    }
  });
});
