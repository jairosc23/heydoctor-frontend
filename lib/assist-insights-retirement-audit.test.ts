import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEPRECATED_AI_COMPONENTS,
  LIVE_AI_SURFACES,
  RETIRED_UI_MOUNTS,
  runAssistInsightsRetirementAudit,
} from "./assist-insights-retirement-audit";

describe("assist-insights-retirement-audit Phase 4.8.3D", () => {
  it("inventaria 3 mounts retirados", () => {
    assert.equal(RETIRED_UI_MOUNTS.length, 3);
    assert.ok(
      RETIRED_UI_MOUNTS.every((m) => m.phase483dStatus === "unmounted"),
    );
  });

  it("marca componentes legacy como deprecated exports", () => {
    assert.ok(DEPRECATED_AI_COMPONENTS.length >= 2);
    assert.ok(
      DEPRECATED_AI_COMPONENTS.some(
        (c) => c.exportName === "ConsultationAssistPanel",
      ),
    );
    assert.ok(
      DEPRECATED_AI_COMPONENTS.some((c) => c.exportName === "AiInsightsPanel"),
    );
  });

  it("superficies IA visibles = Copilot + LiveAiNotes (+ autofill)", () => {
    assert.equal(LIVE_AI_SURFACES.length, 4);
    assert.ok(LIVE_AI_SURFACES.some((s) => s.includes("Copilot")));
    assert.ok(LIVE_AI_SURFACES.some((s) => s.includes("LiveAiNoteSuggestions")));
  });

  it("producción [id] no monta Assist/Insights ni tab Asistencia", () => {
    const audit = runAssistInsightsRetirementAudit();
    if (!audit.passed) {
      assert.fail(
        `Mounts prohibidos: ${audit.productionMountViolations.join(", ")}`,
      );
    }
  });
});
