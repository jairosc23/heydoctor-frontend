import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CODE_AUDIT_FINDINGS,
  computeE2eCoverage,
  E2E_FLAG_MATRIX,
  E2E_SPEC_REFERENCE,
  evaluateP0CaseResults,
  evaluateWorkspaceActivationGoNoGo,
  P0_CLINICAL_CASES,
  PLAYWRIGHT_INFRA,
  runClinicalE2eProductionReadinessSummary,
} from "./clinical-e2e-production-readiness-audit";

describe("clinical-e2e-production-readiness-audit Phase 4.8.6", () => {
  it("define 4 casos P0 obligatorios alineados a flujos clínicos", () => {
    assert.equal(P0_CLINICAL_CASES.length, 4);
    assert.ok(P0_CLINICAL_CASES.some((c) => c.id === "p0-hta-followup"));
    assert.ok(P0_CLINICAL_CASES.some((c) => c.id === "p0-dm2-lab"));
    assert.ok(P0_CLINICAL_CASES.some((c) => c.id === "p0-acute-new-patient"));
    assert.ok(P0_CLINICAL_CASES.some((c) => c.id === "p0-payment-lock"));
  });

  it("cada caso P0 exige flags workspace oficial ON", () => {
    assert.ok(
      P0_CLINICAL_CASES.every((c) => c.flagMatrix === "official"),
    );
    assert.equal(
      E2E_FLAG_MATRIX.required.NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE,
      "1",
    );
    assert.equal(
      E2E_FLAG_MATRIX.required.NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE,
      "1",
    );
  });

  it("documenta hallazgos reales de pre-flight estático", () => {
    assert.ok(CODE_AUDIT_FINDINGS.length >= 10);
    assert.ok(CODE_AUDIT_FINDINGS.some((f) => f.id === "F1-canPay-completed"));
    assert.ok(
      CODE_AUDIT_FINDINGS.some((f) => f.id === "F2-autosave-no-flush-sign"),
    );
    assert.ok(
      CODE_AUDIT_FINDINGS.some((f) => f.id === "F4-legacy-consultas-page"),
    );
  });

  it("pre-flight estático falla casos P0 con blockers conocidos", () => {
    const results = evaluateP0CaseResults();
    assert.equal(results.length, 4);
    assert.ok(results.every((r) => r.runtimeStatus === "not_executed"));
    assert.ok(results.every((r) => r.staticPreflight === "fail"));
    assert.ok(results.every((r) => r.blockers.length > 0));
  });

  it("cobertura E2E incluye superficies obligatorias", () => {
    const coverage = computeE2eCoverage();
    assert.equal(coverage.surfaces.length, 10);
    assert.ok(coverage.surfaces.every((s) => s.coveredByP0));
    assert.ok(coverage.staticPreflightComplete);
    assert.equal(coverage.runtimeExecuted, false);
  });

  it("infra Playwright spec preparada con package instalado", () => {
    assert.equal(PLAYWRIGHT_INFRA.exists, true);
    assert.ok(PLAYWRIGHT_INFRA.specPath?.includes("clinical-p0.spec.ts"));
    assert.equal(PLAYWRIGHT_INFRA.packageInstalled, true);
  });

  it("referencia spec 4.8.1 original", () => {
    assert.ok(E2E_SPEC_REFERENCE.totalCases >= 7);
    assert.ok(E2E_SPEC_REFERENCE.p0FromOriginal >= 4);
    assert.equal(E2E_SPEC_REFERENCE.p0Phase486, 4);
  });

  it("veredicto NO GO para activación workspace hasta E2E runtime", () => {
    const verdict = evaluateWorkspaceActivationGoNoGo();
    assert.equal(verdict.decision, "NO_GO");
    assert.ok(verdict.blockers.length >= 4);
    assert.ok(verdict.conditions.length >= 3);
  });

  it("resumen audit coherente", () => {
    const summary = runClinicalE2eProductionReadinessSummary();
    assert.equal(summary.p0Cases, 4);
    assert.equal(summary.p0StaticFail, 4);
    assert.equal(summary.p0RuntimeExecuted, 0);
    assert.ok(summary.blockingFindings >= 4);
    assert.equal(summary.goNoGo, "NO_GO");
    assert.ok(summary.playwrightReady);
  });
});
