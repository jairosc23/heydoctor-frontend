import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEPRECATED_AI_COMPONENTS,
  LIVE_AI_SURFACES,
  RETIRED_UI_MOUNTS,
  runAssistInsightsRetirementAudit,
} from "./assist-insights-retirement-audit";

describe("assist-insights-retirement-audit Phase 4.8.3D / E3-0c", () => {
  it("inventaria 3 mounts retirados", () => {
    assert.equal(RETIRED_UI_MOUNTS.length, 3);
    assert.ok(
      RETIRED_UI_MOUNTS.filter((m) => m.component !== "Tab Asistencia").every(
        (m) => m.phase483dStatus === "removed",
      ),
    );
  });

  it("marca Assist/Insights como removed (E3-0c)", () => {
    assert.ok(
      DEPRECATED_AI_COMPONENTS.some(
        (c) =>
          c.exportName === "ConsultationAssistPanel" && c.status === "removed",
      ),
    );
    assert.ok(
      DEPRECATED_AI_COMPONENTS.some(
        (c) => c.exportName === "AiInsightsPanel" && c.status === "removed",
      ),
    );
  });

  it("superficies IA visibles = Copilot + LiveAiNotes (+ autofill)", () => {
    assert.equal(LIVE_AI_SURFACES.length, 4);
    assert.ok(LIVE_AI_SURFACES.some((s) => s.includes("Copilot")));
    assert.ok(LIVE_AI_SURFACES.some((s) => s.includes("LiveAiNoteSuggestions")));
  });

  it("producción [id] no monta Assist/Insights; sources removed", () => {
    const audit = runAssistInsightsRetirementAudit();
    if (!audit.passed) {
      assert.fail(
        `Violations: ${[
          ...audit.productionMountViolations,
          ...audit.removedSourceViolations,
        ].join(", ")}`,
      );
    }
  });
});
