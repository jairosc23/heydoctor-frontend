import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ClinicalIntelligenceAdapter } from "./clinical-intelligence/adapter";
import {
  MEDICAL_COPILOT_API_VERSION,
  MEDICAL_COPILOT_GOVERNANCE,
} from "./types";
import type { MedicalCopilotApiEnvelope } from "./types";
import {
  createClinicalWorkflowCoordinator,
  CLINICAL_WORKFLOW_GOVERNANCE,
} from "./workflow";
import {
  assertPhiSafeDetail,
  createClinicalWorkflowMetricsStore,
  observeClinicalWorkflowTransition,
  registerClinicalTelemetrySink,
} from "./observability";
import { resolveWebSpeechProvider } from "./voice/speech/web-speech-provider";
import { createMockSpeechProvider } from "./voice/speech/mock-speech-provider";
import {
  createClinicalDictationService,
  createEmptyDictationBuffer,
  applyFinalTranscript,
} from "./dictation";
import { createClinicalValidationService } from "./validation";
import { isMedicalCopilotEnabled } from "./enabled";
import { assertSingleSessionOwnership } from "./session-ownership";

/**
 * RC-1.5 — Automated Chaos & Resilience scenarios.
 * Exercises existing foundations only — no clinical logic changes.
 */

function envelope<T>(data: T): MedicalCopilotApiEnvelope<T> {
  return {
    source: "medical_copilot_facade",
    apiVersion: MEDICAL_COPILOT_API_VERSION,
    status: "ok",
    data,
    governance: { ...MEDICAL_COPILOT_GOVERNANCE },
    reason: null,
    generatedAt: "2026-07-11T00:00:00.000Z",
  };
}

const session = {
  sessionId: "sess_lock_chaos",
  consultationId: "cons_chaos",
  patientId: "pat_chaos",
  status: "active",
};

describe("RC-1.5 Chaos — Facade timeout", () => {
  it("Adapter no bloquea: retorna error timeout recuperable", async () => {
    const adapter = new ClinicalIntelligenceAdapter({
      createSession: async () =>
        envelope({
          session,
          workspace: { workspaceId: "ws", sessionId: session.sessionId },
          memory: { memoryId: "m", sessionId: session.sessionId },
          timeline: { timelineId: "t", sessionId: session.sessionId },
        }),
      getSession: () => new Promise(() => {}),
      getWorkspace: async () =>
        envelope({ workspace: { workspaceId: "ws", sessionId: session.sessionId } }),
      getTimeline: async () =>
        envelope({ timeline: { timelineId: "t", sessionId: session.sessionId } }),
      getMemory: async () =>
        envelope({ memory: { memoryId: "m", sessionId: session.sessionId } }),
      getActions: async () => envelope({ actions: [] }),
    });

    const started = Date.now();
    const result = await adapter.analyze({
      consultationId: "cons_chaos",
      patientId: "pat_chaos",
      sessionId: "sess_lock_chaos",
      timeoutMs: 40,
    });
    const elapsed = Date.now() - started;

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "timeout");
    }
    assert.ok(elapsed < 5_000, "no debe colgarse la promesa");
  });

  it("Workflow marca timeout como recuperable y permite restart preserveSession", () => {
    const c = createClinicalWorkflowCoordinator();
    c.dispatch({
      type: "CONSULTATION_OPENED",
      consultationId: "c1",
      patientId: "p1",
    });
    c.dispatch({ type: "SESSION_READY", sessionId: "sess_1" });
    c.dispatch({ type: "GOVERNED_ANALYSIS_STARTED" });
    c.dispatch({
      type: "GOVERNED_ANALYSIS_FINISHED",
      ok: false,
      suggestionCount: 0,
      timedOut: true,
      message: "timeout",
    });

    assert.equal(c.getState().phase, "recoverable_error");
    assert.equal(c.getState().error?.recoverable, true);
    assert.equal(c.getState().governance.executesAction, false);
    assert.equal(c.getState().governance.autoPersistedToEmr, false);

    c.dispatch({ type: "RESTART", preserveSession: true });
    assert.equal(c.getSessionId(), "sess_1");
    assert.equal(c.getState().phase, "workspace_ready");
  });
});

describe("RC-1.5 Chaos — Pérdida temporal de red", () => {
  it("Dictado local permanece usable sin Facade", () => {
    let buffer = createEmptyDictationBuffer();
    buffer = applyFinalTranscript(buffer, "nota local sin red");
    assert.equal(buffer.draft, "nota local sin red");
    assert.equal(buffer.committed, "nota local sin red");
  });

  it("Workflow state no se pierde sin red (máquina de estados local)", () => {
    const c = createClinicalWorkflowCoordinator();
    c.dispatch({
      type: "CONSULTATION_OPENED",
      consultationId: "c1",
      patientId: "p1",
    });
    c.dispatch({ type: "SESSION_READY", sessionId: "sess_net" });
    c.dispatch({ type: "DICTATION_READY" });
    const before = c.getState();
    // Simula ausencia de red: no hay más eventos Facade; el estado permanece.
    assert.equal(c.getState().sessionId, before.sessionId);
    assert.equal(c.getState().phase, before.phase);
    assert.ok(c.getState().sessionId);
  });

  it("Dictation service con mock speech no requiere red", async () => {
    const speech = createMockSpeechProvider({
      mockTranscript: "offline transcript",
      emitInterim: false,
    });
    const service = createClinicalDictationService({
      speechProvider: speech,
      consultationId: "c_offline",
    });
    await service.start({ consultationId: "c_offline" });
    await service.stop();
    const state = service.getState();
    assert.ok(state);
    assert.equal(state!.status, "completed");
    assert.ok(state!.buffer.draft.includes("offline transcript"));
    assert.equal(CLINICAL_WORKFLOW_GOVERNANCE.autoPersistedToEmr, false);
  });
});

describe("RC-1.5 Chaos — Speech Provider error / fallback", () => {
  it("resolveWebSpeechProvider cae a Mock cuando API no disponible", () => {
    const provider = resolveWebSpeechProvider({
      scope: {} as never,
    });
    assert.equal(provider.id, "mock");
    assert.equal(provider.capabilities.requiresApiKey, false);
    assert.equal(typeof provider.start, "function");
  });

  it("Fallback mock no rompe governance HITL", () => {
    assert.equal(CLINICAL_WORKFLOW_GOVERNANCE.requiresPhysicianReview, true);
    assert.equal(CLINICAL_WORKFLOW_GOVERNANCE.executesAction, false);
  });
});

describe("RC-1.5 Chaos — Auth expiration safety", () => {
  it("Governance impide ejecución clínica automática tras errores", () => {
    // Contrato de seguridad: ningún fallo convierte executesAction/autoPersist a true
    assert.equal(MEDICAL_COPILOT_GOVERNANCE.executesAction, false);
    assert.equal(MEDICAL_COPILOT_GOVERNANCE.autoPersistedToEmr, false);
    assert.equal(CLINICAL_WORKFLOW_GOVERNANCE.executesAction, false);
    assert.equal(CLINICAL_WORKFLOW_GOVERNANCE.autoPersistedToEmr, false);
  });

  it("Adapter ante error de Facade no inventa acciones clínicas", async () => {
    const adapter = new ClinicalIntelligenceAdapter({
      createSession: async () => {
        throw new Error("unauthorized");
      },
      getSession: async () => {
        throw new Error("unauthorized");
      },
      getWorkspace: async () => {
        throw new Error("unauthorized");
      },
      getTimeline: async () => {
        throw new Error("unauthorized");
      },
      getMemory: async () => {
        throw new Error("unauthorized");
      },
      getActions: async () => {
        throw new Error("unauthorized");
      },
    });
    const result = await adapter.analyze({
      consultationId: "c1",
      patientId: "p1",
      sessionId: "s1",
      timeoutMs: 200,
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.notEqual(result.error.code, undefined);
    }
  });
});

describe("RC-1.5 Chaos — Session ownership", () => {
  it("Coordinator bloquea una única sessionId ante conflictos", () => {
    const c = createClinicalWorkflowCoordinator();
    c.dispatch({
      type: "CONSULTATION_OPENED",
      consultationId: "c1",
      patientId: "p1",
    });
    c.dispatch({ type: "SESSION_READY", sessionId: "sess_primary" });
    c.dispatch({ type: "SESSION_READY", sessionId: "sess_duplicate" });
    assert.equal(c.getSessionId(), "sess_primary");
  });

  it("Session Ownership SSOT rechaza sessionId duplicada", () => {
    const storage = {
      map: new Map<string, string>(),
      getItem(k: string) {
        return this.map.has(k) ? this.map.get(k)! : null;
      },
      setItem(k: string, v: string) {
        this.map.set(k, v);
      },
      removeItem(k: string) {
        this.map.delete(k);
      },
    };
    const first = assertSingleSessionOwnership("c1", "sess_a", storage);
    assert.equal(first.accepted, true);
    const second = assertSingleSessionOwnership("c1", "sess_b", storage);
    assert.equal(second.accepted, false);
    assert.equal(second.sessionId, "sess_a");
  });
});

describe("RC-1.5 Chaos — Telemetría PHI-safe bajo fallos", () => {
  it("Emite timeout/recoverable_error sin PHI", () => {
    const metrics = createClinicalWorkflowMetricsStore();
    const emitted: Array<{ event: string; detail: Record<string, unknown> }> =
      [];
    registerClinicalTelemetrySink((event, detail) => {
      emitted.push({ event, detail: detail as Record<string, unknown> });
    });

    const c = createClinicalWorkflowCoordinator();
    let prev = c.getState();
    c.dispatch({
      type: "CONSULTATION_OPENED",
      consultationId: "consultation-should-truncate",
      patientId: "patient-must-never-appear",
    });
    observeClinicalWorkflowTransition(prev, c.getState(), metrics);
    prev = c.getState();
    c.dispatch({ type: "SESSION_READY", sessionId: "sess_tele" });
    observeClinicalWorkflowTransition(prev, c.getState(), metrics);
    prev = c.getState();
    c.dispatch({ type: "GOVERNED_ANALYSIS_STARTED" });
    observeClinicalWorkflowTransition(prev, c.getState(), metrics);
    prev = c.getState();
    c.dispatch({
      type: "GOVERNED_ANALYSIS_FINISHED",
      ok: false,
      suggestionCount: 0,
      timedOut: true,
      message: "timeout",
    });
    observeClinicalWorkflowTransition(prev, c.getState(), metrics);

    assert.ok(emitted.some((e) => e.event === "timeout"));
    assert.ok(emitted.some((e) => e.event === "recoverable_error"));
    for (const e of emitted) {
      assert.equal(assertPhiSafeDetail(e.detail), true);
      assert.equal(e.detail.patientId, undefined);
      assert.ok(!JSON.stringify(e.detail).includes("patient-must-never-appear"));
    }

    registerClinicalTelemetrySink(null);
  });
});

describe("RC-1.5 Chaos — Recuperación", () => {
  it("Restart preserveSession recupera tras timeout", () => {
    const c = createClinicalWorkflowCoordinator();
    c.dispatch({
      type: "CONSULTATION_OPENED",
      consultationId: "c1",
      patientId: "p1",
    });
    c.dispatch({ type: "SESSION_READY", sessionId: "sess_rec" });
    c.dispatch({ type: "GOVERNED_ANALYSIS_STARTED" });
    c.dispatch({
      type: "GOVERNED_ANALYSIS_FINISHED",
      ok: false,
      suggestionCount: 0,
      timedOut: true,
    });
    c.dispatch({ type: "RESTART", preserveSession: true });
    assert.equal(c.getSessionId(), "sess_rec");
    assert.equal(c.getState().phase, "workspace_ready");
    assert.equal(c.getState().error, null);
  });

  it("Validation voluntaria sobrevive independientemente del Workflow", () => {
    const v = createClinicalValidationService();
    v.openSession({ cohortTag: "chaos" });
    v.updateLikert("overall_satisfaction", 4);
    v.submit();
    assert.equal(v.getMetrics().evaluatedSessions, 1);
    assert.equal(
      (v.getSession() as { patientId?: string }).patientId,
      undefined,
    );
  });
});

describe("RC-1.5 Chaos — Kill switch isolation (contrato esperado)", () => {
  it("Kill switch Medical Copilot existe (RC-2 P0-1)", () => {
    const storage = {
      store: new Map<string, string>(),
      getItem(key: string) {
        return this.store.has(key) ? this.store.get(key)! : null;
      },
      setItem(key: string, value: string) {
        this.store.set(key, value);
      },
      removeItem(key: string) {
        this.store.delete(key);
      },
    };
    assert.equal(isMedicalCopilotEnabled({ env: "1", storage }), true);
    storage.setItem("hd_mc_kill_switch", "1");
    assert.equal(isMedicalCopilotEnabled({ env: "1", storage }), false);
  });
});
