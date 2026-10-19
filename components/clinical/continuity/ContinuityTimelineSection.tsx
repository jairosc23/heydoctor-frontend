"use client";

import type { ContinuityTimelineSummary } from "@/lib/continuity-platform/types";

export function ContinuityTimelineSection({
  timeline,
  loading,
}: {
  timeline: ContinuityTimelineSummary | null;
  loading?: boolean;
}) {
  const events = timeline?.events ?? [];
  return (
    <section data-testid="continuity-timeline-section" className="space-y-1.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Línea de tiempo
      </h3>
      {loading ? (
        <p className="text-xs text-slate-400">Cargando…</p>
      ) : events.length === 0 ? (
        <p className="text-xs text-slate-500">Sin eventos recientes.</p>
      ) : (
        <ul className="space-y-1">
          {events.map((e) => (
            <li
              key={`${e.versionId}:${e.eventType}:${e.occurredAt}`}
              className="rounded-md border border-slate-100 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            >
              <span className="font-medium capitalize">{e.eventType}</span>
              <span className="text-slate-500">
                {" "}
                · {new Date(e.occurredAt).toLocaleString()}
              </span>
              {e.medicationNames?.length ? (
                <span className="block text-slate-500">
                  {e.medicationNames.join(", ")}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
