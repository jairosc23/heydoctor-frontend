import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertPhiSafeDetail,
  buildSafeDetail,
  createClinicalWorkflowMetricsStore,
  observeClinicalWorkflowTransition,
  CLINICAL_OBSERVABILITY_VERSION,
} from "./index";
import {
  INITIAL_WORKFLOW_STATE,
  reduceClinicalWorkflow,
  type WorkflowState,
} from "../workflow";

function run(events: Parameters<typeof reduceClinicalWorkflow>[1][]): WorkflowState {
  return events.reduce(
    (s, e) => reduceClinicalWorkflow(s, e),
    INITIAL_WORKFLOW_STATE,
  );
}

describe("Clinical Observability PHI-safe", () => {
  it("buildSafeDetail omite claves clínicas y versiona payload", () => {
    const detail = buildSafeDetail({
      phase: "hitl_review",
      status: "awaiting_physician",
      consultationRef: "cons_1234",
      ...({
        patientId: "pat_should_not_appear",
        dictationText: "paciente con cefalea intensa",
      } as object),
    });

    assert.equal(detail.observabilityVersion, CLINICAL_OBSERVABILITY_VERSION);
    assert.equal(detail.phase, "hitl_review");
    assert.equal(
      (detail as Record<string, unknown>).patientId,
      undefined,
    );
    assert.equal(
      (detail as Record<string, unknown>).dictationText,
      undefined,
    );
    assert.equal(assertPhiSafeDetail(detail as Record<string, unknown>), true);
  });
});

describe("Clinical Workflow telemetry observer", () => {
  it("emite consulta abierta, workflow started y completado con métricas", () => {
    const metrics = createClinicalWorkflowMetricsStore();
    const emitted: string[] = [];
    const emit = ((event: string, detail: Record<string, unknown>) => {
      emitted.push(event);
      assert.equal(assertPhiSafeDetail(detail), true);
      return detail;
    }) as typeof import("./emit").emitClinicalTelemetry;

    const s1 = run([
      {
        type: "CONSULTATION_OPENED",
        consultationId: "cons_abc",
        patientId: "pat_secret",
      },
    ]);
    observeClinicalWorkflowTransition(INITIAL_WORKFLOW_STATE, s1, metrics, {
      emit,
      nowMs: 1_000,
    });

    const s2 = run([
      {
        type: "CONSULTATION_OPENED",
        consultationId: "cons_abc",
        patientId: "pat_secret",
      },
      { type: "SESSION_READY", sessionId: "sess_xyz" },
      { type: "CONSULTATION_ENDED" },
    ]);
    observeClinicalWorkflowTransition(s1, s2, metrics, {
      emit,
      nowMs: 5_000,
    });

    assert.ok(emitted.includes("consultation_opened"));
    assert.ok(emitted.includes("workflow_started"));
    assert.ok(emitted.includes("workflow_completed"));
    const snap = metrics.snapshot();
    assert.equal(snap.workflowStartedCount, 1);
    assert.equal(snap.workflowCompletedCount, 1);
    assert.equal(snap.completionRate, 1);
    assert.ok((snap.lastWorkflowDurationMs ?? 0) >= 0);
  });

  it("instrumenta dictado, análisis gobernado, timeout y restart", () => {
    const metrics = createClinicalWorkflowMetricsStore();
    const emitted: string[] = [];
    const emit = ((event: string, detail: Record<string, unknown>) => {
      emitted.push(event);
      assert.ok(!("patientId" in detail));
      assert.ok(!JSON.stringify(detail).includes("cefalea"));
      return detail;
    }) as typeof import("./emit").emitClinicalTelemetry;

    let prev = run([
      {
        type: "CONSULTATION_OPENED",
        consultationId: "cons_1",
        patientId: "pat_1",
      },
      { type: "SESSION_READY", sessionId: "sess_1" },
    ]);
    observeClinicalWorkflowTransition(INITIAL_WORKFLOW_STATE, prev, metrics, {
      emit,
      nowMs: 100,
    });

    let next = reduceClinicalWorkflow(prev, {
      type: "DICTATION_ACTIVE",
      active: true,
    });
    let obs = observeClinicalWorkflowTransition(prev, next, metrics, {
      emit,
      nowMs: 200,
    });
    assert.ok(emitted.includes("dictation_started"));

    prev = next;
    next = reduceClinicalWorkflow(prev, {
      type: "DICTATION_ACTIVE",
      active: false,
    });
    obs = observeClinicalWorkflowTransition(prev, next, metrics, {
      emit,
      nowMs: 500,
      dictationStartedAtMs: obs.nextDictationStartedAtMs,
    });
    assert.ok(emitted.includes("dictation_finalized"));
    assert.ok(metrics.snapshot().dictationDurationMs >= 300);

    prev = next;
    next = reduceClinicalWorkflow(prev, { type: "GOVERNED_ANALYSIS_STARTED" });
    observeClinicalWorkflowTransition(prev, next, metrics, {
      emit,
      nowMs: 800,
    });
    assert.ok(emitted.includes("governed_analysis_requested"));

    prev = next;
    next = reduceClinicalWorkflow(prev, {
      type: "GOVERNED_ANALYSIS_FINISHED",
      ok: false,
      suggestionCount: 0,
      timedOut: true,
      message: "timeout",
    });
    observeClinicalWorkflowTransition(prev, next, metrics, {
      emit,
      nowMs: 900,
    });
    assert.ok(emitted.includes("timeout"));
    assert.ok(emitted.includes("recoverable_error"));

    prev = next;
    next = reduceClinicalWorkflow(prev, {
      type: "RESTART",
      preserveSession: true,
    });
    observeClinicalWorkflowTransition(prev, next, metrics, {
      emit,
      nowMs: 1_000,
    });
    assert.ok(emitted.includes("restart_preserve_session"));
    assert.equal(metrics.snapshot().restartCount, 1);
    assert.equal(metrics.snapshot().governedRequestCount, 1);
    assert.equal(metrics.snapshot().timeoutCount, 1);
  });

  it("no incluye patientId ni texto clínico en emissions", () => {
    const metrics = createClinicalWorkflowMetricsStore();
    const details: Record<string, unknown>[] = [];
    const emit = ((event: string, detail: Record<string, unknown>) => {
      details.push(detail);
      return detail;
    }) as typeof import("./emit").emitClinicalTelemetry;

    const next = run([
      {
        type: "CONSULTATION_OPENED",
        consultationId: "consultation-uuid-long",
        patientId: "patient-should-never-leak",
      },
    ]);
    observeClinicalWorkflowTransition(null, next, metrics, { emit });

    for (const d of details) {
      assert.equal(d.patientId, undefined);
      assert.equal(typeof d.consultationRef, "string");
      assert.ok(String(d.consultationRef).length <= 8);
      assert.equal(assertPhiSafeDetail(d), true);
    }
  });
});
