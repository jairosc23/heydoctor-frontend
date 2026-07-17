/**
 * AR-2 — Frontend Foundation consolidation & production readiness.
 * Validates runtime, kill switch, fallback, nav contract, telemetry/feedback
 * without changing clinical Copilot behavior.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  applyMedicalCopilotServerRuntime,
  getMedicalCopilotServerKillSwitch,
  isMedicalCopilotEnabled,
  parseMedicalCopilotEnvFlag,
  resetMedicalCopilotServerRuntimeCache,
  setMedicalCopilotRuntimeKillSwitch,
} from "./enabled";
import {
  getMedicalCopilotSsePrepStatus,
  MEDICAL_COPILOT_SSE_PATH,
} from "./realtime/sse-prep";
import { MEDICAL_COPILOT_GOVERNANCE } from "./types";

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

describe("AR-2 Foundation readiness — runtime & kill switch", () => {
  beforeEach(() => {
    resetMedicalCopilotServerRuntimeCache();
  });

  it("HITL invariants remain frozen for v1.0 compatibility", () => {
    assert.equal(MEDICAL_COPILOT_GOVERNANCE.requiresPhysicianReview, true);
    assert.equal(MEDICAL_COPILOT_GOVERNANCE.executesAction, false);
    assert.equal(MEDICAL_COPILOT_GOVERNANCE.autoPersistedToEmr, false);
  });

  it("server kill switch disables Copilot when runtime reports killed", () => {
    const storage = memoryStorage();
    applyMedicalCopilotServerRuntime({ enabled: false, killSwitch: true });
    assert.equal(getMedicalCopilotServerKillSwitch(), true);
    assert.equal(
      isMedicalCopilotEnabled({ env: "1", storage }),
      false,
    );
  });

  it("local kill switch still overrides server enabled (v1.0 compatible)", () => {
    const storage = memoryStorage();
    applyMedicalCopilotServerRuntime({ enabled: true, killSwitch: false });
    setMedicalCopilotRuntimeKillSwitch(true, storage);
    assert.equal(isMedicalCopilotEnabled({ env: "1", storage }), false);
  });

  it("fallback when runtime unavailable keeps env/local decision", () => {
    const storage = memoryStorage();
    applyMedicalCopilotServerRuntime(null);
    assert.equal(getMedicalCopilotServerKillSwitch(), null);
    assert.equal(isMedicalCopilotEnabled({ env: "1", storage }), true);
    assert.equal(parseMedicalCopilotEnvFlag("0"), false);
    assert.equal(
      isMedicalCopilotEnabled({ env: "0", storage }),
      false,
    );
  });

  it("SSE prep remains non-productive (no streaming epic)", () => {
    const status = getMedicalCopilotSsePrepStatus();
    assert.equal(status.productive, false);
    assert.equal(status.ready, false);
    assert.equal(status.pathTemplate, MEDICAL_COPILOT_SSE_PATH);
  });
});

describe("AR-2 Foundation readiness — navigation & API contracts", () => {
  it("Encounter → Copilot path contract is stable", () => {
    const consultationId = "549cb299-a827-4872-88ea-8e2e77250685";
    const href = `/panel/consultas/${consultationId}/medical-copilot`;
    assert.match(href, /\/panel\/consultas\/.+\/medical-copilot$/);
  });

  it("runtime / telemetry / feedback API paths remain under /medical-copilot", () => {
    const base = "/medical-copilot";
    assert.equal(`${base}/runtime`, "/medical-copilot/runtime");
    assert.equal(`${base}/telemetry`, "/medical-copilot/telemetry");
    assert.equal(`${base}/feedback`, "/medical-copilot/feedback");
  });
});
