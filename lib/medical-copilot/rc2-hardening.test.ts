import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isMedicalCopilotEnabled,
  parseMedicalCopilotEnvFlag,
  readMedicalCopilotRuntimeKillSwitch,
  setMedicalCopilotRuntimeKillSwitch,
  MEDICAL_COPILOT_KILL_SWITCH_STORAGE_KEY,
} from "./enabled";
import {
  assertSingleSessionOwnership,
  clearMedicalCopilotSessionOwnership,
  getOwnedMedicalCopilotSessionId,
  rememberMedicalCopilotSessionOwnership,
} from "./session-ownership";
import { bootstrapMedicalCopilotSession } from "./bootstrap-session";
import {
  MEDICAL_COPILOT_API_VERSION,
  MEDICAL_COPILOT_GOVERNANCE,
} from "./types";
import type { MedicalCopilotApiEnvelope } from "./types";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
    removeItem(key: string) {
      map.delete(key);
    },
    key() {
      return null;
    },
  } as Storage;
}

function envelope<T>(
  data: T,
  status: "ok" | "not_found" = "ok",
): MedicalCopilotApiEnvelope<T> {
  return {
    source: "medical_copilot_facade",
    apiVersion: MEDICAL_COPILOT_API_VERSION,
    status,
    data,
    governance: { ...MEDICAL_COPILOT_GOVERNANCE },
    reason: null,
    generatedAt: "2026-07-11T00:00:00.000Z",
  };
}

describe("RC-2 P0-1 Kill Switch", () => {
  it("env flag desactiva Copilot sin afectar contratos HITL", () => {
    assert.equal(parseMedicalCopilotEnvFlag(undefined), true);
    assert.equal(parseMedicalCopilotEnvFlag("0"), false);
    assert.equal(parseMedicalCopilotEnvFlag("off"), false);
    assert.equal(parseMedicalCopilotEnvFlag("1"), true);
    assert.equal(MEDICAL_COPILOT_GOVERNANCE.executesAction, false);
  });

  it("runtime localStorage kill switch es reversible sin redeploy", () => {
    const storage = memoryStorage();
    assert.equal(
      isMedicalCopilotEnabled({ env: "1", storage }),
      true,
    );
    setMedicalCopilotRuntimeKillSwitch(true, storage);
    assert.equal(readMedicalCopilotRuntimeKillSwitch(storage), true);
    assert.equal(isMedicalCopilotEnabled({ env: "1", storage }), false);
    setMedicalCopilotRuntimeKillSwitch(false, storage);
    assert.equal(isMedicalCopilotEnabled({ env: "1", storage }), true);
    assert.ok(MEDICAL_COPILOT_KILL_SWITCH_STORAGE_KEY);
  });

  it("AR-1 server kill switch desactiva Copilot cuando runtime lo indica", () => {
    const storage = memoryStorage();
    assert.equal(
      isMedicalCopilotEnabled({
        env: "1",
        storage,
        serverKillSwitch: true,
      }),
      false,
    );
    assert.equal(
      isMedicalCopilotEnabled({
        env: "1",
        storage,
        serverKillSwitch: false,
      }),
      true,
    );
  });
});

describe("RC-2 P0-2 Session Ownership", () => {
  it("recuerda una sola sessionId por consulta y rechaza duplicados", () => {
    const storage = memoryStorage();
    rememberMedicalCopilotSessionOwnership("cons_1", "sess_a", storage);
    assert.equal(getOwnedMedicalCopilotSessionId("cons_1", storage), "sess_a");

    const dup = assertSingleSessionOwnership("cons_1", "sess_b", storage);
    assert.equal(dup.accepted, false);
    assert.equal(dup.duplicateAttempt, true);
    assert.equal(dup.sessionId, "sess_a");
    assert.equal(getOwnedMedicalCopilotSessionId("cons_1", storage), "sess_a");
  });

  it("bootstrap restaura owned session y no crea otra", async () => {
    const storage = memoryStorage();
    rememberMedicalCopilotSessionOwnership("cons_1", "sess_owned", storage);
    let createCalls = 0;

    const result = await bootstrapMedicalCopilotSession(
      { consultationId: "cons_1", patientId: "pat_1" },
      {
        createSession: async () => {
          createCalls += 1;
          return envelope({
            session: {
              sessionId: "sess_new",
              consultationId: "cons_1",
              patientId: "pat_1",
            },
            workspace: { workspaceId: "w", sessionId: "sess_new" },
            memory: { memoryId: "m", sessionId: "sess_new" },
            timeline: { timelineId: "t", sessionId: "sess_new" },
          });
        },
        getSession: async (id) =>
          envelope({
            session: {
              sessionId: id,
              consultationId: "cons_1",
              patientId: "pat_1",
            },
          }),
        getWorkspace: async (id) =>
          envelope({ workspace: { workspaceId: "w", sessionId: id } }),
        getTimeline: async (id) =>
          envelope({ timeline: { timelineId: "t", sessionId: id } }),
        getMemory: async (id) =>
          envelope({ memory: { memoryId: "m", sessionId: id } }),
        getActions: async () => envelope({ actions: [] }),
        storage,
      },
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.restored, true);
      assert.equal(result.session.sessionId, "sess_owned");
    }
    assert.equal(createCalls, 0);
  });
});

describe("RC-2 P0-3 Auth Recovery", () => {
  it("conserva ownership tras fallo auth y restaura tras re-login", async () => {
    const storage = memoryStorage();
    rememberMedicalCopilotSessionOwnership("cons_auth", "sess_auth", storage);

    const fail = await bootstrapMedicalCopilotSession(
      { consultationId: "cons_auth", patientId: "pat_1" },
      {
        createSession: async () => {
          throw new Error("should not create");
        },
        getSession: async () => {
          throw new Error("401 unauthorized jwt expired");
        },
        getWorkspace: async () => {
          throw new Error("401");
        },
        getTimeline: async () => {
          throw new Error("401");
        },
        getMemory: async () => {
          throw new Error("401");
        },
        getActions: async () => {
          throw new Error("401");
        },
        storage,
      },
    );

    assert.equal(fail.ok, false);
    if (!fail.ok) {
      assert.equal(fail.authRequired, true);
      assert.equal(fail.ownedSessionId, "sess_auth");
    }
    assert.equal(
      getOwnedMedicalCopilotSessionId("cons_auth", storage),
      "sess_auth",
    );

    // Re-login simulation: getSession works again → same session restored
    const ok = await bootstrapMedicalCopilotSession(
      { consultationId: "cons_auth", patientId: "pat_1" },
      {
        createSession: async () => {
          throw new Error("must not create after auth recovery");
        },
        getSession: async (id) =>
          envelope({
            session: {
              sessionId: id,
              consultationId: "cons_auth",
              patientId: "pat_1",
            },
          }),
        getWorkspace: async (id) =>
          envelope({ workspace: { workspaceId: "w", sessionId: id } }),
        getTimeline: async (id) =>
          envelope({ timeline: { timelineId: "t", sessionId: id } }),
        getMemory: async (id) =>
          envelope({ memory: { memoryId: "m", sessionId: id } }),
        getActions: async () => envelope({ actions: [] }),
        storage,
      },
    );

    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.restored, true);
      assert.equal(ok.session.sessionId, "sess_auth");
    }
    assert.equal(MEDICAL_COPILOT_GOVERNANCE.executesAction, false);
    assert.equal(MEDICAL_COPILOT_GOVERNANCE.autoPersistedToEmr, false);
  });

  it("clear ownership solo cuando se pide explícitamente", () => {
    const storage = memoryStorage();
    rememberMedicalCopilotSessionOwnership("c", "s", storage);
    clearMedicalCopilotSessionOwnership("c", storage);
    assert.equal(getOwnedMedicalCopilotSessionId("c", storage), null);
  });
});
