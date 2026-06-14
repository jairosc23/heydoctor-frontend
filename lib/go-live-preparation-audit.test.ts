import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  E2E_ENV_VARS,
  E2E_EXECUTION_STEPS,
  evaluateGoLiveVerdict,
  GO_LIVE_CHECK,
  GO_LIVE_DECISION_MATRIX,
  PLAYWRIGHT_CONFIG_AUDIT,
  runGoLivePreparationSummary,
  VERCEL_PREVIEW_RUNBOOK,
  VISUAL_VALIDATIONS,
} from "./go-live-preparation-audit";

describe("go-live-preparation-audit Phase 4.9.2", () => {
  it("runbook Vercel preview incluye ambos flags y redeploy", () => {
    assert.ok(VERCEL_PREVIEW_RUNBOOK.length >= 8);
    const text = VERCEL_PREVIEW_RUNBOOK.map((s) => s.action).join(" ");
    assert.match(text, /CLINICAL_ACTION_WORKSPACE/);
    assert.match(text, /SMART_CLINICAL_WORKSPACE/);
    assert.match(text, /Redeploy/);
  });

  it("validaciones visuales exigen layout 2-col oficial", () => {
    assert.ok(VISUAL_VALIDATIONS.some((v) => v.id === "v-layout-2col"));
    assert.ok(VISUAL_VALIDATIONS.some((v) => v.id === "v-no-3col"));
  });

  it("E2E audit — 7 variables requeridas documentadas", () => {
    assert.equal(E2E_ENV_VARS.length, 7);
    assert.ok(E2E_ENV_VARS.every((v) => v.required));
    assert.ok(E2E_ENV_VARS.some((v) => v.name === "E2E_BASE_URL"));
    assert.ok(E2E_ENV_VARS.some((v) => v.name === "E2E_CONSULTATION_PAYMENT"));
  });

  it("guía ejecución E2E sin ambigüedad", () => {
    assert.ok(E2E_EXECUTION_STEPS.length >= 8);
    assert.ok(E2E_EXECUTION_STEPS.some((s) => s.includes("test:e2e")));
    assert.ok(E2E_EXECUTION_STEPS.some((s) => s.includes(".env.e2e")));
  });

  it("playwright config audit coherente con spec", () => {
    assert.equal(PLAYWRIGHT_CONFIG_AUDIT.totalTestsPerRun, 10);
    assert.ok(PLAYWRIGHT_CONFIG_AUDIT.specPath.includes("clinical-p0.spec.ts"));
  });

  it("GO-LIVE CHECK cubre preview, e2e, smoke y prod", () => {
    assert.ok(GO_LIVE_CHECK.length >= 15);
    assert.ok(GO_LIVE_CHECK.some((i) => i.phase === "preview"));
    assert.ok(GO_LIVE_CHECK.some((i) => i.phase === "prod"));
    assert.ok(GO_LIVE_CHECK.filter((i) => i.required).length >= 10);
  });

  it("matriz decisión — prod requiere preview + e2e", () => {
    assert.match(GO_LIVE_DECISION_MATRIX.prodGo, /previewReady/);
    assert.match(GO_LIVE_DECISION_MATRIX.prodGo, /e2eReady/);
  });

  it("veredicto PENDING_OPS — preparación sin activación", () => {
    const verdict = evaluateGoLiveVerdict();
    assert.equal(verdict.workspaceProdActivation, "PENDING_OPS");
    assert.ok(verdict.nextSteps.length >= 3);
  });

  it("resumen audit coherente", () => {
    const summary = runGoLivePreparationSummary();
    assert.ok(summary.runbookSteps >= 8);
    assert.equal(summary.e2eRequiredVars, 7);
    assert.equal(summary.p0Cases, 4);
    assert.equal(summary.verdict, "PENDING_OPS");
  });
});
