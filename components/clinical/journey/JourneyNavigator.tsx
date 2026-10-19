"use client";

import { useCallback, useEffect, useState } from "react";
import {
  advanceConsultationJourney,
  listLegalNextStages,
  startConsultationJourney,
} from "@/lib/journey-orchestrator/api";
import { isClientHardDeniedJourneyTransition } from "@/lib/journey-orchestrator/legal-transitions";
import {
  JOURNEY_STAGE_LABELS,
  type ConsultationJourneySession,
  type JourneyStage,
} from "@/lib/journey-orchestrator/types";

/**
 * E03 Journey Navigator — stage chrome; illegal nav blocked.
 * Does not emit, confirm, or persist clinical masters.
 */
export function JourneyNavigator({
  consultationId,
  patientId,
  enabled,
  contextBound,
}: {
  consultationId: string;
  patientId: string;
  enabled: boolean;
  contextBound: boolean;
}) {
  const [session, setSession] = useState<ConsultationJourneySession | null>(
    null,
  );
  const [legalNext, setLegalNext] = useState<JourneyStage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refreshLegal = useCallback(async () => {
    if (!consultationId) return;
    try {
      const next = await listLegalNextStages(consultationId);
      setLegalNext(Array.isArray(next) ? next : []);
    } catch {
      setLegalNext([]);
    }
  }, [consultationId]);

  useEffect(() => {
    if (!enabled || !contextBound || !consultationId || !patientId) return;
    let cancelled = false;
    (async () => {
      try {
        const started = await startConsultationJourney({
          consultationId,
          patientId,
        });
        if (!cancelled) {
          setSession(started);
          setError(null);
          await refreshLegal();
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "journey_start_failed",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, contextBound, consultationId, patientId, refreshLegal]);

  const advance = async (to: JourneyStage) => {
    if (!session || busy) return;
    if (isClientHardDeniedJourneyTransition(session.stage, to)) {
      setError(`JOURNEY_ILLEGAL: ${session.stage} → ${to}`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await advanceConsultationJourney({
        consultationId,
        to,
      });
      setSession(next);
      await refreshLegal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "journey_advance_failed");
    } finally {
      setBusy(false);
    }
  };

  if (!enabled) return null;

  return (
    <div
      data-testid="journey-navigator"
      className="space-y-2 border-t border-hd-border-subtle bg-hd-surface-muted/80 px-3 py-2"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-hd-text-muted">
          Consultation Journey
        </h3>
        <span
          className="text-[10px] font-medium text-hd-text-muted"
          data-testid="journey-non-authority"
        >
          Coordina · no confirma · no emite
        </span>
      </div>
      {!contextBound ? (
        <p className="text-xs text-amber-900" role="status">
          Contexto no vinculado — journey bloqueado (fail-closed).
        </p>
      ) : null}
      {session ? (
        <p className="text-sm font-medium text-hd-text" data-testid="journey-stage">
          {JOURNEY_STAGE_LABELS[session.stage] ?? session.stage}
        </p>
      ) : (
        <p className="text-xs text-hd-text-muted">Sin sesión de journey</p>
      )}
      <div className="flex flex-wrap gap-1.5" data-testid="journey-legal-next">
        {(legalNext ?? []).map((stage) => {
          const denied =
            session != null &&
            isClientHardDeniedJourneyTransition(session.stage, stage);
          return (
            <button
              key={stage}
              type="button"
              data-testid={`journey-advance-${stage}`}
              disabled={busy || !contextBound || denied || !session}
              className="rounded border border-hd-border bg-white px-2 py-1 text-[11px] font-medium text-hd-text disabled:opacity-40"
              onClick={() => void advance(stage)}
            >
              → {JOURNEY_STAGE_LABELS[stage] ?? stage}
            </button>
          );
        })}
      </div>
      {/* Explicit: Assist→Confirm control must not appear as a primary illegal shortcut */}
      <button
        type="button"
        data-testid="journey-illegal-assist-to-confirm"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onClick={() => {
          if (session) {
            void advance("AwaitingConfirmation");
          }
        }}
      />
      {error ? (
        <p className="text-xs text-red-700" role="alert" data-testid="journey-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
