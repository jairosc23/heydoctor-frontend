"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type { LiveClinicalInsightsBatch } from "@/lib/epic3/live-clinical-insights";

export function CopilotLiveClinicalInsights({
  batch,
  loading,
  error,
  onRegenerate,
  onDiscard,
}: {
  batch: LiveClinicalInsightsBatch | null;
  loading: boolean;
  error: string | null;
  onRegenerate: () => void;
  onDiscard: (id: string) => void;
}) {
  return (
    <section
      aria-label="Real-Time Clinical Insights"
      data-testid="copilot-live-clinical-insights"
      className="space-y-hd-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
            EPIC-3 · Live · Propuesta Copilot
          </p>
          <h3 className={CLINICAL_SECTION_TITLE}>Real-Time Clinical Insights</h3>
          <p className="text-[11px] text-slate-500">
            Solo sugerencias · descartables · no se guardan en el EMR
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={loading}
          className="clinical-interactive shrink-0 rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-hd-surface-muted disabled:opacity-50"
          data-testid="live-insights-regenerate"
        >
          {loading ? "Generando…" : "Regenerar"}
        </button>
      </div>

      {batch?.assistiveOnlyNotice ? (
        <p
          role="note"
          className="rounded-hd-md border border-amber-200/80 bg-amber-50/70 px-hd-2 py-hd-2 text-[11px] text-amber-900"
        >
          {batch.assistiveOnlyNotice}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-[11px] text-rose-700">
          {error}
        </p>
      ) : null}

      {loading && !batch?.insights.length ? (
        <p className="text-[11px] text-slate-500">
          Generando insights con AiService (gobernado)…
        </p>
      ) : null}

      {!loading && batch && batch.insights.length === 0 ? (
        <p className="text-[11px] text-slate-500">
          No hay insights activos. Use Regenerar para volver a proponer.
        </p>
      ) : null}

      <ul className="space-y-hd-2">
        {(batch?.insights ?? []).map((item, index) => (
          <li
            key={item.id}
            data-testid={`live-insight-${item.id}`}
            className="rounded-hd-md border border-primary/20 bg-primaryLight/20 px-hd-3 py-hd-2"
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                Sugerencia del Copilot #{index + 1}
              </p>
              <button
                type="button"
                onClick={() => onDiscard(item.id)}
                className="text-[10px] font-medium text-slate-500 hover:text-rose-700"
                data-testid={`live-insight-discard-${item.id}`}
              >
                Descartar
              </button>
            </div>
            <p className="text-xs leading-snug text-slate-800">{item.text}</p>
          </li>
        ))}
      </ul>

      {batch?.aiRunId ? (
        <p className="font-mono text-[10px] text-slate-400">
          aiRunId: {batch.aiRunId.slice(0, 12)}… · persistsToEmr: false
        </p>
      ) : null}
    </section>
  );
}
