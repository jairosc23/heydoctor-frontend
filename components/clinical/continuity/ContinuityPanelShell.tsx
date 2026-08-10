"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/context/AuthContext";
import type { PassiveContinuityHint } from "@/lib/continuity-platform/types";
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
  isContinuityHandoffInFlight,
  runContinuityHydrationHandoff,
} from "./continuity-hydration-handoff";
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
import { useClinicalSnapshot } from "@/hooks/useClinicalSnapshot";
import { ClinicalSnapshotPanel } from "@/components/encounter/ClinicalSnapshotPanel";
import { CLINICAL_OVERLAY_Z } from "@/lib/clinical-overlay-contract";

/**
 * Owns state machine, memory cache apply, generationId + AbortController.
 * Read-only Continuity Context surface — no Composer / emit / Renew.
 * Consumes the shared Clinical Snapshot (CCE) — same Encounter Memory as Workspace.
 */
export function ContinuityPanelShell({
  patientId,
  encounterId = null,
  open,
  onOpenChange,
}: ContinuityPanelProps) {
  const { user } = useAuth();
  const clinicalSnapshot = useClinicalSnapshot();
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
  const [handoffBusy, setHandoffBusy] = useState(false);
  const [handoffMessage, setHandoffMessage] = useState<string | null>(null);

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

  const handleUseHint = useCallback(
    async (hint: PassiveContinuityHint) => {
      if (handoffBusy || isContinuityHandoffInFlight()) return;
      if (!model.context) {
        setHandoffMessage("Contexto de continuidad no disponible.");
        return;
      }
      if (!user?.id || !user.clinicId) {
        setHandoffMessage("Sesión de médico requerida para usar en Composer.");
        return;
      }

      setHandoffBusy(true);
      setHandoffMessage(null);
      try {
        const result = await runContinuityHydrationHandoff({
          hint,
          context: model.context,
          encounterId,
          actor: {
            actorDoctorId: user.id,
            clinicId: user.clinicId,
            patientId,
          },
        });
        if (result.ok) {
          setHandoffMessage(
            "Borrador cargado en Composer. Revise y confirme antes de emitir.",
          );
        } else {
          setHandoffMessage(handoffErrorMessage(result.code));
        }
      } finally {
        setHandoffBusy(false);
      }
    },
    [handoffBusy, model.context, user, patientId, encounterId],
  );

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

  /**
   * P0 Navigation SSOT: Continuity must NOT inflate sticky encounter chrome.
   * Portal/sheet below chrome — same panel data/UX, single Continuity surface.
   */
  const panel = (
    <div
      className="pointer-events-auto mx-auto w-full max-w-5xl space-y-3 rounded-hd-lg border border-slate-200 bg-slate-50 p-3 shadow-hd-3"
      data-testid="continuity-panel-shell"
      data-continuity-host="portal"
      data-ui-state={model.uiState}
      data-panel-contract={
        loading ? "loading" : model.uiState === "Empty" ? "empty" : "ready"
      }
      data-generation-id={model.generationId}
    >
      <ContinuityToolbar
        uiState={model.uiState}
        onRefresh={handleRefresh}
        onDismiss={handleDismiss}
        onRetry={handleRetry}
      />

      {/* Same Clinical Snapshot as Workspace capabilities — not a second context. */}
      <ClinicalSnapshotPanel snapshot={clinicalSnapshot} variant="compact" />

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
            handoffBusy={handoffBusy}
            ctaDisabled={
              model.uiState !== "Loaded" && model.uiState !== "Empty"
            }
            onUseHint={handleUseHint}
            handoffMessage={handoffMessage}
            patientId={patientId}
            encounterId={encounterId}
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

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="clinical-overlay-continuity pointer-events-none fixed left-0 right-0 md:left-64 px-3 md:px-4 lg:px-5"
      style={{
        zIndex: CLINICAL_OVERLAY_Z.continuity,
        top: "calc(var(--encounter-chrome-h, 5.5rem) + 0.5rem)",
        maxHeight:
          "min(70vh, calc(100dvh - var(--encounter-chrome-h, 5.5rem) - 1rem))",
      }}
      data-testid="continuity-panel-portal"
    >
      <div className="pointer-events-none max-h-[inherit] overflow-y-auto overscroll-contain pb-3">
        {panel}
      </div>
    </div>,
    document.body,
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

function handoffErrorMessage(code: string): string {
  switch (code) {
    case "composer_busy":
      return "Composer tiene un borrador activo. Finalice o limpie antes de hidratar.";
    case "assert_denied":
      return "El hint no cumple la política de hidratación Continuity.";
    case "invalid_hint":
      return "Hint de continuidad inválido para Composer.";
    case "context_missing":
      return "Falta contexto de continuidad para el handoff.";
    case "patient_mismatch":
      return "El paciente del Panel no coincide con la sesión.";
    case "in_flight":
      return "Ya hay un handoff en curso.";
    case "handoff_rejected":
    default:
      return "No se pudo aplicar el hint en Composer. Abra Prescripciones e intente de nuevo.";
  }
}
