import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ENVIRONMENT_AUDIT,
  evaluatePhase491WorkspaceActivation,
  POST_DEPLOY_SMOKE_TESTS,
  RUNTIME_E2E_SESSION,
  runStagingActivationRuntimeE2eSummary,
  VERCEL_STAGING_ACTIVATION_STEPS,
  WORKSPACE_ACTIVATION_CHECKLIST,
} from "./staging-activation-runtime-e2e-audit";

describe("staging-activation-runtime-e2e-audit Phase 4.9.1", () => {
  it("audita flags workspace — expected ON, repo default OFF", () => {
    assert.equal(ENVIRONMENT_AUDIT.length, 2);
    assert.ok(ENVIRONMENT_AUDIT.every((f) => f.expectedValue === "1"));
    assert.ok(ENVIRONMENT_AUDIT.every((f) => f.defaultInCode === false));
    assert.ok(ENVIRONMENT_AUDIT.every((f) => f.vercelProdModified === false));
  });

  it("documenta pasos Vercel staging sin tocar prod", () => {
    assert.ok(VERCEL_STAGING_ACTIVATION_STEPS.length >= 10);
    assert.ok(
      VERCEL_STAGING_ACTIVATION_STEPS.some((s) => s.includes("NO modificar Production")),
    );
  });

  it("checklist activación exige ambos workspace ON", () => {
    assert.ok(WORKSPACE_ACTIVATION_CHECKLIST.actionWorkspaceOn.includes("=1"));
    assert.ok(WORKSPACE_ACTIVATION_CHECKLIST.smartWorkspaceOn.includes("=1"));
  });

  it("runtime E2E sesión 4.9.1 — skipped sin credenciales", () => {
    assert.equal(RUNTIME_E2E_SESSION.skipped, 10);
    assert.equal(RUNTIME_E2E_SESSION.passed, 0);
    assert.equal(RUNTIME_E2E_SESSION.cases.length, 4);
    assert.ok(RUNTIME_E2E_SESSION.cases.every((c) => c.status === "skipped"));
  });

  it("smoke tests — gates 4.9.0 static pass, runtime skipped", () => {
    assert.ok(
      POST_DEPLOY_SMOKE_TESTS.some(
        (s) => s.id === "smoke-payment-gate" && s.status === "static_pass",
      ),
    );
    assert.ok(
      POST_DEPLOY_SMOKE_TESTS.filter((s) => s.method === "e2e").every(
        (s) => s.status === "skipped",
      ),
    );
  });

  it("veredicto NO GO activación prod workspace", () => {
    const verdict = evaluatePhase491WorkspaceActivation();
    assert.equal(verdict.workspaceProdActivation, "NO_GO");
    assert.ok(verdict.blockers.length >= 3);
  });

  it("resumen audit coherente", () => {
    const summary = runStagingActivationRuntimeE2eSummary();
    assert.equal(summary.envFlags, 2);
    assert.equal(summary.defaultOffInCode, true);
    assert.equal(summary.vercelProdModified, false);
    assert.equal(summary.e2eSkipped, 10);
    assert.equal(summary.workspaceProdActivation, "NO_GO");
  });
});
