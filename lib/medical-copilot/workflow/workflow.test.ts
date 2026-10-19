import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createClinicalWorkflowCoordinator,
  reduceClinicalWorkflow,
  CLINICAL_WORKFLOW_GOVERNANCE,
  INITIAL_WORKFLOW_STATE,
  type WorkflowState,
} from "./index";

function apply(events: Parameters<typeof reduceClinicalWorkflow>[1][]): WorkflowState {
  return events.reduce(
    (state, event) => reduceClinicalWorkflow(state, event),
    INITIAL_WORKFLOW_STATE,
  );
}

describe("ClinicalWorkflowCoordinator", () => {
  it("orquesta ingreso → bootstrap → session lock → HITL", () => {
    const state = apply([
      {
        type: "CONSULTATION_OPENED",
        consultationId: "cons_1",
        patientId: "pat_1",
      },
      { type: "BOOTSTRAP_STARTED" },
      { type: "SESSION_READY", sessionId: "sess_lock_1" },
      { type: "DICTATION_READY" },
      { type: "VOICE_INTEL_UPDATED", suggestionCount: 2 },
      { type: "GOVERNED_ANALYSIS_STARTED" },
      {
        type: "GOVERNED_ANALYSIS_FINISHED",
        ok: true,
        suggestionCount: 3,
      },
    ]);

    assert.equal(state.sessionId, "sess_lock_1");
    assert.equal(state.phase, "hitl_review");
    assert.equal(state.status, "awaiting_physician");
    assert.equal(state.governedSuggestionCount, 3);
    assert.equal(state.governance.requiresPhysicianReview, true);
    assert.equal(state.governance.executesAction, false);
    assert.equal(state.governance.autoPersistedToEmr, false);
    assert.equal(CLINICAL_WORKFLOW_GOVERNANCE.requiresPhysicianReview, true);
    assert.ok(state.progress.percent > 0);
    assert.ok(
      state.progress.steps.some(
        (s) => s.id === "hitl" && s.state === "current",
      ),
    );
  });

  it("bloquea sessionId ante SESSION_READY conflictivo", () => {
    const state = apply([
      {
        type: "CONSULTATION_OPENED",
        consultationId: "cons_1",
        patientId: "pat_1",
      },
      { type: "SESSION_READY", sessionId: "sess_a" },
      { type: "SESSION_READY", sessionId: "sess_b" },
    ]);
    assert.equal(state.sessionId, "sess_a");
  });

  it("marca error recuperable y permite reinicio conservando sesión", () => {
    const coordinator = createClinicalWorkflowCoordinator();
    coordinator.dispatch({
      type: "CONSULTATION_OPENED",
      consultationId: "cons_1",
      patientId: "pat_1",
    });
    coordinator.dispatch({ type: "SESSION_READY", sessionId: "sess_1" });
    coordinator.dispatch({
      type: "BOOTSTRAP_FAILED",
      message: "red intermitente",
    });
    assert.equal(coordinator.getState().phase, "recoverable_error");
    assert.equal(coordinator.getState().error?.recoverable, true);

    coordinator.dispatch({ type: "RESTART", preserveSession: true });
    assert.equal(coordinator.getSessionId(), "sess_1");
    assert.equal(coordinator.getState().phase, "workspace_ready");
    assert.equal(coordinator.getState().error, null);
  });

  it("finaliza consulta sin ejecutar Skills ni EMR", () => {
    const state = apply([
      {
        type: "CONSULTATION_OPENED",
        consultationId: "cons_1",
        patientId: "pat_1",
      },
      { type: "SESSION_READY", sessionId: "sess_1" },
      { type: "CONSULTATION_ENDED" },
    ]);
    assert.equal(state.phase, "consultation_complete");
    assert.equal(state.status, "completed");
    assert.equal(state.governance.executesAction, false);
    assert.equal(state.governance.autoPersistedToEmr, false);
    assert.equal(state.progress.percent, 100);
  });

  it("GOVERNED_ANALYSIS_FINISHED timeout es recuperable", () => {
    const state = apply([
      {
        type: "CONSULTATION_OPENED",
        consultationId: "cons_1",
        patientId: "pat_1",
      },
      { type: "SESSION_READY", sessionId: "sess_1" },
      { type: "GOVERNED_ANALYSIS_STARTED" },
      {
        type: "GOVERNED_ANALYSIS_FINISHED",
        ok: false,
        suggestionCount: 0,
        timedOut: true,
        message: "timeout",
      },
    ]);
    assert.equal(state.phase, "recoverable_error");
    assert.equal(state.governedAnalysisStatus, "timeout");
    assert.equal(state.error?.code, "governed_timeout");
  });
});
