"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  destroyContinuityCacheForPatient,
  putContinuityCache,
  readContinuityCache,
} from "./continuity-panel-cache";
import {
  runContextFetch,
  shouldDiscardFetchResult,
  type ContinuityFetchJob,
} from "./continuity-panel-fetch";
import {
  bannersFromContext,
  ContinuityBanner,
} from "./ContinuityBanner";
import { ContinuityActiveSection } from "./ContinuityActiveSection";
import { ContinuityHintsSection } from "./ContinuityHintsSection";
import { ContinuityTimelineSection } from "./ContinuityTimelineSection";
import { ContinuityToolbar } from "./ContinuityToolbar";
import {
  createInitialContinuityPanelModel,
  isContinuityPanelVisible,
  reduceContinuityPanel,
} from "./continuity-panel-state";
import type { ContinuityPanelProps } from "./continuity-panel.types";

/**
 * Owns state machine, memory cache apply, generationId + AbortController.
 * Read-only Continuity Context surface — no Composer / emit / Renew.
 */
export function ContinuityPanelShell({
  patientId,
  encounterId = null,
  open,
  onOpenChange,
}: ContinuityPanelProps) {
  const [model, dispatch] = useReducer(
    reduceContinuityPanel,
    createInitialContinuityPanelModel(patientId, encounterId),
  );
  const modelRef = useRef(model);
  modelRef.current = model;
  const inFlightRef = useRef<AbortController | null>(null);
  const prevOpenRef = useRef(open);
  const prevPatientRef = useRef(patientId);
  const prevEncounterRef = useRef(encounterId);

  const abortInFlight = useCallback(() => {
    inFlightRef.current?.abort();
    inFlightRef.current = null;
  }, []);

  const startFetch = useCallback(
    (generationId: number, pid: string, eid: string | null | undefined) => {
      abortInFlight();
      const ac = new AbortController();
      inFlightRef.current = ac;
      const job: ContinuityFetchJob = {
        generationId,
        patientId: pid,
        encounterId: eid,
        signal: ac.signal,
      };

      void runContextFetch(job).then((result) => {
        const current = modelRef.current;
        if (shouldDiscardFetchResult(current, job)) {
          return;
        }
        if (result.ok) {
          putContinuityCache(pid, eid, result.context);
          dispatch({ type: "FETCH_SUCCESS", context: result.context });
        } else {
          dispatch({ type: "FETCH_ERROR", error: result.error });
        }
        if (inFlightRef.current === ac) inFlightRef.current = null;
      });
    },
    [abortInFlight],
  );

  // Patient / encounter isolation
  useEffect(() => {
    if (
      prevPatientRef.current !== patientId ||
      prevEncounterRef.current !== encounterId
    ) {
      abortInFlight();
      destroyContinuityCacheForPatient(prevPatientRef.current);
      dispatch({
        type: "PATIENT_CHANGE",
        patientId,
        encounterId,
      });
      prevPatientRef.current = patientId;
      prevEncounterRef.current = encounterId;
      if (open) {
        // Re-open clean for new patient after reset — effect below handles OPEN
        onOpenChange(false);
      }
    }
  }, [patientId, encounterId, open, onOpenChange, abortInFlight]);

  // Unmount = encounter leave
  useEffect(() => {
    return () => {
      abortInFlight();
      destroyContinuityCacheForPatient(patientId);
      dispatch({ type: "ENCOUNTER_LEAVE" });
    };
  }, [patientId, abortInFlight]);

  // Controlled open → OPEN / REOPEN / DISMISS
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (open && !wasOpen) {
      const current = modelRef.current;
      if (current.uiState === "Dismissed") {
        dispatch({ type: "REOPEN" });
      } else if (current.uiState === "Closed") {
        dispatch({ type: "OPEN" });
      }
    } else if (!open && wasOpen) {
      const current = modelRef.current;
      if (
        current.uiState !== "Closed" &&
        current.uiState !== "Dismissed"
      ) {
        abortInFlight();
        dispatch({ type: "DISMISS" });
      }
    }
  }, [open, abortInFlight]);

  // After Opening: CACHE_HIT | CACHE_MISS then fetch
  useEffect(() => {
    if (model.uiState !== "Opening") return;

    const cached = readContinuityCache(model.patientId, model.encounterId);
    if (cached) {
      dispatch({ type: "CACHE_HIT", context: cached });
      startFetch(model.generationId, model.patientId, model.encounterId);
    } else {
      dispatch({ type: "CACHE_MISS" });
      startFetch(model.generationId, model.patientId, model.encounterId);
    }
  }, [
    model.uiState,
    model.generationId,
    model.patientId,
    model.encounterId,
    startFetch,
  ]);

  // RETRY → Loading: start fetch when entering Loading from Error
  const prevUiRef = useRef(model.uiState);
  useEffect(() => {
    const prev = prevUiRef.current;
    prevUiRef.current = model.uiState;
    if (model.uiState === "Loading" && prev === "Error") {
      startFetch(model.generationId, model.patientId, model.encounterId);
    }
    if (model.uiState === "Refreshing" && prev !== "Opening" && prev !== "Refreshing") {
      // REFRESH from Loaded/Empty (not cache-hit path which also lands in Refreshing from Opening)
      if (prev === "Loaded" || prev === "Empty") {
        startFetch(model.generationId, model.patientId, model.encounterId);
      }
    }
  }, [
    model.uiState,
    model.generationId,
    model.patientId,
    model.encounterId,
    startFetch,
  ]);

  const handleDismiss = () => {
    abortInFlight();
    dispatch({ type: "DISMISS" });
    onOpenChange(false);
  };

  const handleRefresh = () => {
    dispatch({ type: "REFRESH" });
  };

  const handleRetry = () => {
    dispatch({ type: "RETRY" });
  };

  if (!isContinuityPanelVisible(model.uiState)) {
    return null;
  }

  const loading =
    model.uiState === "Opening" ||
    model.uiState === "Loading" ||
    model.uiState === "Refreshing";
  const showSections =
    model.uiState === "Loaded" ||
    model.uiState === "Empty" ||
    model.uiState === "Refreshing" ||
    model.uiState === "Loading" ||
    model.uiState === "Opening";

  const bannerModel = bannersFromContext(
    model.context,
    model.softError,
    model.error,
  );

  return (
    <div
      className="mt-2 space-y-3 rounded-hd-lg border border-slate-200 bg-slate-50/80 p-3"
      data-testid="continuity-panel-shell"
      data-ui-state={model.uiState}
      data-generation-id={model.generationId}
    >
      <ContinuityToolbar
        uiState={model.uiState}
        onRefresh={handleRefresh}
        onDismiss={handleDismiss}
        onRetry={handleRetry}
      />

      {model.uiState === "Error" ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
          data-testid="continuity-error"
          role="alert"
        >
          {errorMessage(model.error?.code)}
        </div>
      ) : null}

      <ContinuityBanner model={bannerModel} />

      {showSections && model.uiState !== "Error" ? (
        <>
          {/* Rendering contract order: Active → Timeline → Hints */}
          <ContinuityActiveSection
            medications={model.context?.activeMedications ?? []}
            loading={loading && !model.context}
          />
          <ContinuityTimelineSection
            timeline={model.context?.timelineSummary ?? null}
            loading={loading && !model.context}
          />
          <ContinuityHintsSection
            hints={model.context?.hints ?? []}
            loading={loading && !model.context}
          />
        </>
      ) : null}

      {model.uiState === "Empty" ? (
        <p
          className="text-center text-xs text-slate-500"
          data-testid="continuity-empty"
        >
          No hay medicación activa, eventos ni sugerencias para este paciente.
        </p>
      ) : null}
    </div>
  );
}

function errorMessage(code: string | undefined): string {
  switch (code) {
    case "version_unsupported":
      return "Versión de Continuity Context no soportada (406).";
    case "forbidden":
      return "Sin acceso al contexto de continuidad de este paciente.";
    case "not_found":
      return "Paciente no encontrado.";
    case "unauthorized":
      return "Sesión no válida. Vuelva a iniciar sesión.";
    case "invalid_payload":
      return "Respuesta de continuidad inválida.";
    case "network":
      return "Error de red al cargar Continuity. Puede reintentar.";
    default:
      return "No se pudo cargar Continuity. Puede reintentar.";
  }
}
