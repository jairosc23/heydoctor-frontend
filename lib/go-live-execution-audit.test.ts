import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluatePhase493FinalVerdict,
  GO_LIVE_CHECK_EXECUTION,
  HYPOTHETICAL_ACTIVATION_REVIEW,
  listOpenCodeBlockers,
  listOpenTechnicalBlockers,
  runGoLiveExecutionAuditSummary,
  summarizeGoLiveCheckExecution,
} from "./go-live-execution-audit";

describe("go-live-execution-audit Phase 4.9.3", () => {
  it("F1–F4 cerrados; ningún bloqueador código abierto", () => {
    assert.equal(listOpenCodeBlockers().length, 0);
    const open = listOpenTechnicalBlockers();
    assert.ok(open.every((b) => b.id !== "F1-canPay-completed"));
    assert.ok(open.every((b) => b.id !== "F2-autosave-no-flush-sign"));
  });

  it("bloqueadores abiertos son operacionales o residuales bajos", () => {
    const open = listOpenTechnicalBlockers();
    assert.ok(open.some((b) => b.id === "F5-flags-default-off"));
    assert.ok(open.some((b) => b.id === "e2e-runtime-not-executed"));
    assert.ok(open.some((b) => b.id === "F6-chiefComplaint-autosave"));
  });

  it("GO-LIVE CHECK gl-01..18 — ninguno COMPLETADO en sesión", () => {
    assert.equal(GO_LIVE_CHECK_EXECUTION.length, 18);
    const summary = summarizeGoLiveCheckExecution();
    assert.equal(summary.COMPLETADO, 0);
    assert.equal(summary.PENDIENTE, 16);
    assert.equal(summary.NO_VERIFICABLE, 2);
  });

  it("gl-14/gl-15 NO VERIFICABLE — fix unitario sin smoke runtime", () => {
    const gl14 = GO_LIVE_CHECK_EXECUTION.find((i) => i.id === "gl-14");
    const gl15 = GO_LIVE_CHECK_EXECUTION.find((i) => i.id === "gl-15");
    assert.equal(gl14?.status, "NO VERIFICABLE");
    assert.equal(gl15?.status, "NO VERIFICABLE");
  });

  it("hipotético post-ops: GO técnico sin blockers código", () => {
    assert.equal(HYPOTHETICAL_ACTIVATION_REVIEW.recommendation, "GO");
    assert.ok(
      HYPOTHETICAL_ACTIVATION_REVIEW.technicalBlockersRemaining.some((t) =>
        t.includes("Ningún bloqueador de código"),
      ),
    );
  });

  it("veredicto actual NO GO; hipotético GO", () => {
    const verdict = evaluatePhase493FinalVerdict();
    assert.equal(verdict.currentProdActivation, "NO_GO");
    assert.equal(verdict.hypotheticalAfterOps, "GO");
    assert.equal(verdict.openCodeBlockers, 0);
    assert.ok(verdict.blocksProdActivation.length >= 3);
  });

  it("resumen audit coherente", () => {
    const summary = runGoLiveExecutionAuditSummary();
    assert.equal(summary.openCodeBlockers, 0);
    assert.equal(summary.goLiveCheckCompletado, 0);
    assert.equal(summary.currentProdActivation, "NO_GO");
    assert.equal(summary.hypotheticalAfterOps, "GO");
  });
});
