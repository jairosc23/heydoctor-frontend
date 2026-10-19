/**
 * F2-14 — Shared Medical Copilot test fixtures (bootstrap / ownership / CI).
 * No network; no clinical side effects.
 */

import {
  MEDICAL_COPILOT_API_VERSION,
  MEDICAL_COPILOT_GOVERNANCE,
  type MedicalCopilotApiEnvelope,
  type MedicalCopilotApiStatus,
} from "../types";

export function createMemoryStorage(): Storage {
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

export function buildMedicalCopilotEnvelopeFixture<T>(
  data: T,
  status: MedicalCopilotApiStatus = "ok",
  reason: string | null = null,
): MedicalCopilotApiEnvelope<T> {
  return {
    source: "medical_copilot_facade",
    apiVersion: MEDICAL_COPILOT_API_VERSION,
    status,
    data,
    governance: { ...MEDICAL_COPILOT_GOVERNANCE },
    reason,
    generatedAt: "2026-07-17T00:00:00.000Z",
  };
}
