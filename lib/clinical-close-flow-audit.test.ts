import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CLOSE_FLOW_MISSING_STATES,
  CLOSE_FLOW_REUSED_STATES,
  runClinicalCloseFlowAuditSummary,
} from "./clinical-close-flow-audit";

describe("clinical-close-flow-audit Phase 4.8.4", () => {
  it("reutiliza estados existentes sin duplicar lógica Copilot", () => {
    assert.ok(CLOSE_FLOW_REUSED_STATES.length >= 6);
    assert.ok(
      CLOSE_FLOW_REUSED_STATES.every((s) => s.reused),
    );
    assert.ok(
      CLOSE_FLOW_REUSED_STATES.some((s) => s.id === "documentation-gaps"),
    );
  });

  it("documenta estados faltantes para cierre operativo", () => {
    assert.ok(CLOSE_FLOW_MISSING_STATES.length >= 3);
    assert.ok(
      CLOSE_FLOW_MISSING_STATES.some((s) => s.id === "delivery-confirmed"),
    );
  });

  it("resumen audit coherente", () => {
    const summary = runClinicalCloseFlowAuditSummary();
    assert.ok(summary.reusedStates >= 6);
    assert.ok(summary.missingStates >= 3);
    assert.ok(summary.risks >= 3);
  });
});
