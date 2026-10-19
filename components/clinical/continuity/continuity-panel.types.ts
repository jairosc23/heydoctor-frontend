/**
 * PR-10 CCP Wave C1 — Continuity Panel types (Encounter UI only).
 */

import type { ContinuityContext } from "@/lib/continuity-platform/types";

export type ContinuityPanelUiState =
  | "Closed"
  | "Opening"
  | "Loading"
  | "Loaded"
  | "Empty"
  | "Error"
  | "Refreshing"
  | "Dismissed";

export type ContinuityPanelErrorCode =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "version_unsupported"
  | "invalid_payload"
  | "unknown";

export type ContinuityPanelError = {
  code: ContinuityPanelErrorCode;
  httpStatus?: number;
};

export type ContinuityPanelModel = {
  uiState: ContinuityPanelUiState;
  patientId: string;
  encounterId?: string | null;
  generationId: number;
  context: ContinuityContext | null;
  /** Blocking error (Loading path) */
  error: ContinuityPanelError | null;
  /** Soft error (Refreshing path — keep last good context) */
  softError: ContinuityPanelError | null;
};

export type ContinuityPanelEvent =
  | { type: "OPEN" }
  | { type: "REOPEN" }
  | { type: "CACHE_HIT"; context: ContinuityContext }
  | { type: "CACHE_MISS" }
  | { type: "FETCH_SUCCESS"; context: ContinuityContext }
  | { type: "FETCH_ERROR"; error: ContinuityPanelError }
  | { type: "REFRESH" }
  | { type: "RETRY" }
  | { type: "DISMISS" }
  | {
      type: "PATIENT_CHANGE";
      patientId: string;
      encounterId?: string | null;
    }
  | { type: "ENCOUNTER_LEAVE" };

export type ContinuityPanelProps = {
  patientId: string;
  encounterId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
