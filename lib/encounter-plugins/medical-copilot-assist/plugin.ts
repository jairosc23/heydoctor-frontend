import {
  createMedicalCopilotSession,
  getMedicalCopilotGovernedClinicalAssistance,
} from "@/lib/medical-copilot/api";
import type { EncounterRuntimeActor } from "@/lib/encounter-runtime";

export type CopilotAssistUiState =
  | "idle"
  | "loading"
  | "ready"
  | "suggestion"
  | "accepted_local"
  | "rejected"
  | "error";

export type CopilotAssistSuggestion = {
  summary: string;
  raw: unknown;
};

export type CopilotAssistController = {
  state: CopilotAssistUiState;
  suggestion: CopilotAssistSuggestion | null;
  error: string | null;
  copilotSessionId: string | null;
  load: (actor: EncounterRuntimeActor) => Promise<void>;
  acceptLocal: () => void;
  rejectLocal: () => void;
  reset: () => void;
};

/**
 * Copilot Assist plugin controller — HITL only.
 * Accept/Reject update local UI state; never call PE emit or Composer hydrate.
 */
export function createCopilotAssistController(): CopilotAssistController {
  const ctrl: CopilotAssistController = {
    state: "idle",
    suggestion: null,
    error: null,
    copilotSessionId: null,
    async load(actor) {
      ctrl.state = "loading";
      ctrl.error = null;
      ctrl.suggestion = null;
      try {
        const created = await createMedicalCopilotSession({
          consultationId: actor.encounterId,
          patientId: actor.patientId,
        });
        const sessionId = created.data?.session?.sessionId;
        if (!sessionId) {
          throw new Error("copilot_session_missing");
        }
        ctrl.copilotSessionId = sessionId;
        const assistance = await getMedicalCopilotGovernedClinicalAssistance(
          sessionId,
        );
        const summary =
          typeof assistance.data?.runtime === "object" &&
          assistance.data?.runtime !== null
            ? "Asistencia clínica disponible para revisión humana (HITL)."
            : "Asistencia cargada. Revise antes de cualquier acción clínica.";
        ctrl.suggestion = { summary, raw: assistance.data ?? null };
        ctrl.state = "suggestion";
      } catch (err) {
        ctrl.state = "error";
        ctrl.error =
          err instanceof Error ? err.message : "copilot_assist_load_failed";
      }
    },
    acceptLocal() {
      if (ctrl.state !== "suggestion" && ctrl.state !== "ready") return;
      ctrl.state = "accepted_local";
      // Explicit non-goals: no Composer hydrate, no PE emit, no GCP Rx execute.
    },
    rejectLocal() {
      ctrl.suggestion = null;
      ctrl.state = "rejected";
    },
    reset() {
      ctrl.state = "idle";
      ctrl.suggestion = null;
      ctrl.error = null;
      ctrl.copilotSessionId = null;
    },
  };
  return ctrl;
}
