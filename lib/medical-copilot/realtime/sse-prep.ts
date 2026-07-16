/**
 * AR-1 — SSE preparation contract for Medical Copilot (not productive).
 *
 * Productive streaming/SSE remains Medical Copilot v1.1+.
 * This module only documents the future endpoint shape and exposes a
 * no-op client so FE can wire readiness without changing clinical flow.
 */

export const MEDICAL_COPILOT_SSE_PATH = "/medical-copilot/session/:sessionId/events";

export type MedicalCopilotSsePrepStatus = {
  /** Always false in AR-1 — productive SSE is not enabled. */
  productive: false;
  pathTemplate: typeof MEDICAL_COPILOT_SSE_PATH;
  ready: false;
};

export function getMedicalCopilotSsePrepStatus(): MedicalCopilotSsePrepStatus {
  return {
    productive: false,
    pathTemplate: MEDICAL_COPILOT_SSE_PATH,
    ready: false,
  };
}

/**
 * No-op SSE client — prepared for v1.1, does not open EventSource.
 */
export function createMedicalCopilotSseClient(_sessionId: string): {
  connect: () => void;
  disconnect: () => void;
  get active(): boolean;
} {
  return {
    connect() {
      /* intentional no-op until productive SSE */
    },
    disconnect() {
      /* intentional no-op */
    },
    get active() {
      return false;
    },
  };
}
