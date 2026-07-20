"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type { LiveClinicalContextTimelineView } from "@/lib/epic3/live-clinical-context-timeline";

export function CopilotLiveClinicalContextTimeline({
  view,
  loading,
  error,
  onRefresh,
}: {
  view: LiveClinicalContextTimelineView;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  return (
    <section
      aria-label="Clinical Context Timeline"
      data-testid="copilot-live-clinical-context-timeline"
      className="space-y-hd-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
            EPIC-3 · Live · Solo lectura
          </p>
          <h3 className={CLINICAL_SECTION_TITLE}>{view.title}</h3>
          <p className="text-[11px] text-slate-500">
            Eventos existentes · orden cronológico · sin IA
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="clinical-interactive shrink-0 rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-hd-surface-muted disabled:opacity-50"
          data-testid="live-timeline-refresh"
        >
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {error ? (
        <p role="status" className="text-[11px] text-amber-800">
          {error}
        </p>
      ) : null}

      {view.events.length === 0 ? (
        <p className="text-[11px] text-slate-500">
          Aún no hay hitos observables en Consultation, Foundation o sesión
          Copilot.
        </p>
      ) : (
        <ol className="space-y-hd-2 border-l border-hd-border-subtle pl-hd-3">
          {view.events.map((event) => (
            <li
              key={event.id}
              data-testid={`live-timeline-event-${event.eventType}`}
              data-source={event.source}
              className="relative"
            >
              <span className="absolute -left-[0.9rem] top-1.5 h-2 w-2 rounded-full bg-primary" />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {event.label}
                <span className="ml-1 font-normal normal-case text-slate-400">
                  · {event.source}
                </span>
              </p>
              <p className="text-xs text-slate-800">{event.summary}</p>
              <p className="font-mono text-[10px] text-slate-400">
                {event.timestamp}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
