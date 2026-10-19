"use client";

/**
 * EPIC-3 UC-01 — Daily Hub pre-visit wiring hook.
 * Loads Agenda slice + bootstraps Medical Copilot session (read-only).
 * Does not call generative AI, drafts, or EMR writers.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { bootstrapMedicalCopilotSession } from "@/lib/medical-copilot/bootstrap-session";
import {
  buildPreVisitContextView,
  type PreVisitAgendaSlice,
  type PreVisitContextView,
} from "@/lib/epic3/pre-visit-context";
import { resolveAgendaContextForConsultation } from "@/lib/epic3/resolve-agenda-context";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";

export function useDailyHubPreVisit(input: {
  open: boolean;
  consultationId?: string | null;
  patientId?: string | null;
  foundation: ClinicalFoundationBundle | null;
  foundationLoading?: boolean;
  foundationError?: string | null;
}): {
  view: PreVisitContextView;
  agendaLoading: boolean;
} {
  const [agenda, setAgenda] = useState<PreVisitAgendaSlice | null>(null);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] =
    useState<PreVisitContextView["sessionStatus"]>("idle");
  const bootstrappedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!input.open || !input.consultationId || !input.patientId) return;
    let cancelled = false;
    setAgendaLoading(true);
    void resolveAgendaContextForConsultation({
      consultationId: input.consultationId,
      patientId: input.patientId,
    }).then((slice) => {
      if (!cancelled) {
        setAgenda(slice);
        setAgendaLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [input.open, input.consultationId, input.patientId]);

  useEffect(() => {
    if (!input.open || !input.consultationId || !input.patientId) return;
    // Wait for Agenda resolve so session can carry appointmentId when linked.
    if (agendaLoading) return;
    const key = `${input.consultationId}:${input.patientId}`;
    if (bootstrappedFor.current === key) return;
    bootstrappedFor.current = key;
    let cancelled = false;
    setSessionStatus("loading");
    void bootstrapMedicalCopilotSession({
      consultationId: input.consultationId,
      patientId: input.patientId,
      appointmentId: agenda?.appointmentId ?? null,
    }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setSessionId(result.session.sessionId);
        setSessionStatus("ready");
      } else {
        setSessionId(null);
        setSessionStatus("unavailable");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [
    input.open,
    input.consultationId,
    input.patientId,
    agendaLoading,
    agenda?.appointmentId,
  ]);

  const view = useMemo(
    () =>
      buildPreVisitContextView({
        foundation: input.foundation,
        foundationError: input.foundationError ?? null,
        agenda,
        sessionId,
        sessionStatus: input.foundationLoading
          ? sessionStatus === "idle"
            ? "loading"
            : sessionStatus
          : sessionStatus,
      }),
    [
      input.foundation,
      input.foundationError,
      input.foundationLoading,
      agenda,
      sessionId,
      sessionStatus,
    ],
  );

  return { view, agendaLoading };
}
