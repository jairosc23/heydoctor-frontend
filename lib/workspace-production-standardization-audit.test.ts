import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateOfficialWorkspaceDeclaration,
  FILES_AFFECTED,
  FLAG_DEPENDENCIES,
  FLAG_RETIREMENT_ROADMAP,
  LEGACY_LAYOUT_COMPONENTS,
  OFFICIAL_WORKSPACE_PROPOSAL,
  PERMANENT_ACTIVATION_RISKS,
  ROLLBACK_PATHS,
  ROLLBACK_REMOVAL_RISKS,
  runWorkspaceProductionStandardizationAuditSummary,
  WORKSPACE_FLAGS,
  WORKSPACE_LAYOUT_MATRIX,
} from "./workspace-production-standardization-audit";

describe("workspace-production-standardization-audit Phase 4.8.5", () => {
  it("inventaria ambas flags workspace con default false en código", () => {
    assert.equal(WORKSPACE_FLAGS.length, 2);
    assert.ok(
      WORKSPACE_FLAGS.every((f) => f.defaultInCode === false),
      "flags deben default false hasta activación prod",
    );
    assert.ok(
      WORKSPACE_FLAGS.some((f) => f.id === "clinicalActionWorkspace"),
    );
    assert.ok(WORKSPACE_FLAGS.some((f) => f.id === "smartClinicalWorkspace"));
  });

  it("matriz layout incluye combinación auditada 4.7–4.8", () => {
    assert.equal(WORKSPACE_LAYOUT_MATRIX.length, 4);
    const audited = WORKSPACE_LAYOUT_MATRIX.filter((r) => r.auditedExperience);
    assert.equal(audited.length, 1);
    assert.equal(audited[0]?.actionWs, true);
    assert.equal(audited[0]?.smartWs, true);
  });

  it("mapa dependencias cubre page, layout, sheet y smart SOAP", () => {
    assert.ok(FLAG_DEPENDENCIES.length >= 12);
    const files = new Set(FLAG_DEPENDENCIES.map((d) => d.file));
    assert.ok([...files].some((f) => f.includes("page.tsx")));
    assert.ok([...files].some((f) => f.includes("EncounterSplitLayout")));
    assert.ok([...files].some((f) => f.includes("SoapSection")));
    assert.ok([...files].some((f) => f.includes("ClinicalModuleSheet")));
  });

  it("documenta rollback paths y componentes legacy", () => {
    assert.ok(ROLLBACK_PATHS.length >= 4);
    assert.ok(LEGACY_LAYOUT_COMPONENTS.some((c) => c.id === "encounter-right-pane"));
    assert.ok(
      LEGACY_LAYOUT_COMPONENTS.some((c) => c.severity === "retirar"),
    );
  });

  it("propuesta workspace oficial exige ambos flags ON", () => {
    assert.equal(OFFICIAL_WORKSPACE_PROPOSAL.flags.clinicalActionWorkspace, true);
    assert.equal(OFFICIAL_WORKSPACE_PROPOSAL.flags.smartClinicalWorkspace, true);
    assert.ok(OFFICIAL_WORKSPACE_PROPOSAL.rationale.length >= 3);
  });

  it("evalúa riesgos activación permanente y retiro rollback", () => {
    assert.ok(PERMANENT_ACTIVATION_RISKS.length >= 5);
    assert.ok(ROLLBACK_REMOVAL_RISKS.length >= 3);
    assert.ok(
      PERMANENT_ACTIVATION_RISKS.some((r) => r.id === "prod-env-unknown"),
    );
  });

  it("roadmap retiro flags sin implementar en 4.8.5", () => {
    assert.ok(FLAG_RETIREMENT_ROADMAP.length >= 4);
    assert.ok(
      FLAG_RETIREMENT_ROADMAP.some((p) => p.phase === "4.9.4" && p.name.includes("Flag Removal")),
    );
  });

  it("lista archivos afectados incluye libs flags y page principal", () => {
    assert.ok(FILES_AFFECTED.length >= 15);
    assert.ok(FILES_AFFECTED.includes("app/panel/consultas/[id]/page.tsx"));
    assert.ok(FILES_AFFECTED.includes("lib/clinical-action-workspace.ts"));
    assert.ok(FILES_AFFECTED.includes("lib/smart-clinical-workspace.ts"));
  });

  it("veredicto: puede declarar workspace oficial con condiciones", () => {
    const verdict = evaluateOfficialWorkspaceDeclaration();
    assert.equal(verdict.canDeclare, true);
    assert.ok(verdict.conditions.length >= 4);
    assert.match(verdict.summary, /Clinical Action Workspace/);
  });

  it("resumen audit coherente", () => {
    const summary = runWorkspaceProductionStandardizationAuditSummary();
    assert.equal(summary.flags, 2);
    assert.equal(summary.layoutCombinations, 4);
    assert.equal(summary.auditedLayout, 1);
    assert.ok(summary.dependencies >= 12);
    assert.ok(summary.rollbackPaths >= 4);
    assert.equal(summary.canDeclareOfficial, true);
  });
});
