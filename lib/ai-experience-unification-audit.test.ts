import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_ENTRY_POINT_SUMMARY,
  AI_ENTRY_POINTS_INVENTORY,
  AI_TARGET_ARCHITECTURE,
  AI_UNIFICATION_VERDICTS,
  runAiExperienceUnificationAudit,
} from "./ai-experience-unification-audit";

describe("ai-experience-unification-audit Phase 4.8.2", () => {
  it("inventaria ≥7 entry points activos en [id]", () => {
    assert.ok(AI_ENTRY_POINT_SUMMARY.activeInConsultationDetail >= 7);
    assert.equal(AI_ENTRY_POINT_SUMMARY.targetMax, 2);
  });

  it("HeyDoctor Copilot es principal y LiveAiNotes contextual", () => {
    const primary = AI_UNIFICATION_VERDICTS.find(
      (v) => v.component.includes("HeyDoctor Copilot"),
    );
    const contextual = AI_UNIFICATION_VERDICTS.find(
      (v) => v.component.includes("LiveAiNoteSuggestions"),
    );
    assert.equal(primary?.category, "principal");
    assert.equal(contextual?.category, "contextual");
  });

  it("tab Asistencia e Insights candidatos a retiro", () => {
    assert.ok(
      AI_UNIFICATION_VERDICTS.some(
        (v) => v.component === "Tab Asistencia" && v.category === "retiro",
      ),
    );
    assert.ok(
      AI_UNIFICATION_VERDICTS.some(
        (v) => v.component.includes("Insights Panel") && v.category === "retiro",
      ),
    );
  });

  it("arquitectura objetivo tiene exactamente 2 entry points", () => {
    assert.equal(AI_TARGET_ARCHITECTURE.entryPointTarget.after, 2);
    assert.equal(AI_TARGET_ARCHITECTURE.layers.length, 2);
  });

  it("menú Análisis IA apunta a autofill-record no Insights", () => {
    const ep = AI_ENTRY_POINTS_INVENTORY.find(
      (e) => e.id === "ep-menu-analisis-ia",
    );
    assert.match(ep?.backend ?? "", /autofill-record/);
    assert.match(ep?.notes ?? "", /NO abre Insights/);
  });

  it("resumen audit coherente", () => {
    const summary = runAiExperienceUnificationAudit();
    assert.ok(summary.backendEndpoints >= 4);
    assert.ok(summary.transitionSteps >= 6);
  });
});
