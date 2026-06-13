import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACTION_WORKSPACE_VALIDATION,
  CLINICAL_DEDUPLICATION_MAP,
  CONSOLIDATION_ROADMAP,
  E2E_MINIMUM_SPEC,
  IA_UNIFICATION_AUDIT,
  IA_UNIFICATION_PROPOSAL,
  LEGACY_INVENTORY,
  runProductionConsolidationAuditSummary,
} from "./production-consolidation-audit";

describe("production-consolidation-audit Phase 4.8.1", () => {
  it("audita componentes IA y propone consolidación", () => {
    assert.ok(IA_UNIFICATION_AUDIT.length >= 5);
    const copilot = IA_UNIFICATION_AUDIT.find((c) => c.id === "clinical-copilot");
    assert.equal(copilot?.verdict, "mantener");
    assert.ok(IA_UNIFICATION_PROPOSAL.deprecate.length >= 3);
  });

  it("mapa deduplicación cubre dominios clínicos obligatorios", () => {
    const domains = new Set(CLINICAL_DEDUPLICATION_MAP.map((d) => d.domain));
    for (const required of [
      "allergies",
      "active_conditions",
      "medications",
      "clinical_alerts",
    ] as const) {
      assert.ok(domains.has(required), `falta dominio ${required}`);
    }
    const high = CLINICAL_DEDUPLICATION_MAP.filter(
      (d) => d.duplicationSeverity === "alta",
    );
    assert.ok(high.length >= 4);
  });

  it("especifica casos E2E mínimos P0", () => {
    const p0 = E2E_MINIMUM_SPEC.filter((c) => c.priority === "P0");
    assert.ok(p0.length >= 4);
    assert.ok(p0.some((c) => c.id === "e2e-hta-followup"));
    assert.ok(p0.some((c) => c.id === "e2e-payment-lock"));
  });

  it("inventario legacy incluye ruta consultas y tab Asistencia", () => {
    assert.ok(
      LEGACY_INVENTORY.some((i) => i.id === "legacy-consultas-page"),
    );
    assert.ok(LEGACY_INVENTORY.some((i) => i.id === "assist-tab"));
  });

  it("flags workspace default off en código", () => {
    assert.equal(
      ACTION_WORKSPACE_VALIDATION.flags.clinicalActionWorkspace.defaultInCode,
      false,
    );
    assert.equal(
      ACTION_WORKSPACE_VALIDATION.flags.smartClinicalWorkspace.defaultInCode,
      false,
    );
  });

  it("roadmap consolidación sin nuevas fases funcionales clínicas", () => {
    assert.ok(CONSOLIDATION_ROADMAP.length >= 5);
    const summary = runProductionConsolidationAuditSummary();
    assert.ok(summary.highSeverityDupes >= 4);
    assert.ok(summary.e2eCasesP0 >= 4);
  });
});
