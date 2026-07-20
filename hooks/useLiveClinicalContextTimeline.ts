"use client";

/**
 * EPIC-3 UC-03A — Live Clinical Context Timeline hook.
 * Reuses GET /medical-copilot/session/:id/timeline + Foundation/Consultation.
 * No LLM, no EMR writes.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  mergeLiveClinicalContextTimeline,
  type LiveClinicalContextTimelineView,
} from "@/lib/epic3/live-clinical-context-timeline";
import { getMedicalCopilotTimeline } from "@/lib/medical-copilot/api";
import { envelopeIsOk } from "@/lib/medical-copilot/view-model";
import type { MedicalCopilotTimelineEntry } from "@/lib/medical-copilot/types";
import type { NestConsultation } from "@/lib/services/consultations";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";

export function useLiveClinicalContextTimeline(input: {
  open: boolean;
  sessionId: string | null;
  consultation: NestConsultation | null;
  foundation: ClinicalFoundationBundle | null;
}): {
  view: LiveClinicalContextTimelineView;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [entries, setEntries] = useState<MedicalCopilotTimelineEntry[] | null>(
    null,
  );
  const [timelineId, setTimelineId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!input.sessionId) {
      setEntries(null);
      setTimelineId(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const envelope = await getMedicalCopilotTimeline(input.sessionId);
      if (!envelopeIsOk(envelope) || !envelope.data.timeline) {
        setEntries([]);
        setTimelineId(null);
        setError(envelope.reason || "Timeline de sesión no disponible");
        return;
      }
      setTimelineId(envelope.data.timeline.timelineId ?? null);
      setEntries(envelope.data.timeline.entries ?? []);
    } catch {
      setEntries([]);
      setTimelineId(null);
      setError("No se pudo cargar la timeline de sesión");
    } finally {
      setLoading(false);
    }
  }, [input.sessionId]);

  useEffect(() => {
    if (!input.open) return;
    void refresh();
  }, [input.open, input.sessionId, input.foundation?.meta.generatedAt, refresh]);

  const view = useMemo(
    () =>
      mergeLiveClinicalContextTimeline({
        consultation: input.consultation,
        foundation: input.foundation,
        sessionTimelineEntries: entries,
        sessionId: input.sessionId,
        timelineId,
      }),
    [
      input.consultation,
      input.foundation,
      entries,
      input.sessionId,
      timelineId,
    ],
  );

  return { view, loading, error, refresh };
}
