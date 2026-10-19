"use client";

import { useEffect, useState } from "react";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import {
  REVIEW_OBSERVATIONAL_SECTION_IDS,
  type ReviewDecision,
  type ReviewSelectionState,
  type ReviewSelectionSummary,
  type ReviewSelectableItem,
} from "@/lib/epic3/review-selection";
import { cn } from "@/lib/utils";

function decisionLabel(decision: ReviewDecision): string {
  switch (decision) {
    case "accepted":
      return "Aceptado";
    case "edited":
      return "Editado";
    case "discarded":
      return "Descartado";
    default:
      return "Pendiente";
  }
}

function decisionTone(decision: ReviewDecision): string {
  switch (decision) {
    case "accepted":
      return "border-emerald-200 bg-emerald-50/80 text-emerald-800";
    case "edited":
      return "border-sky-200 bg-sky-50/80 text-sky-900";
    case "discarded":
      return "border-slate-200 bg-slate-100 text-slate-500 line-through";
    default:
      return "border-amber-200 bg-amber-50/70 text-amber-900";
  }
}

function ReviewItemCard({
  item,
  onAccept,
  onDiscard,
  onEdit,
}: {
  item: ReviewSelectableItem;
  onAccept: (id: string) => void;
  onDiscard: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}) {
  const [draft, setDraft] = useState(item.displayText);
  const editing = item.decision !== "discarded";

  useEffect(() => {
    setDraft(item.displayText);
  }, [item.id, item.displayText]);

  return (
    <li
      data-testid={`review-selection-item-${item.id}`}
      className={cn(
        "rounded-hd-md border px-hd-3 py-hd-2",
        decisionTone(item.decision),
      )}
    >
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide">
            {item.label} · {item.sourceUc}
          </p>
          <p className="text-[10px] text-slate-500">
            Decisión: {decisionLabel(item.decision)} · H1: {item.h1Status}
            {item.aiRunId
              ? ` · aiRunId ${item.aiRunId.slice(0, 10)}…`
              : " · sin aiRunId"}
            {item.promptVersion ? ` · promptVersion ${item.promptVersion}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            disabled={item.decision === "accepted"}
            onClick={() => onAccept(item.id)}
            className="clinical-interactive rounded-hd-md border border-emerald-300/80 bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-800 disabled:opacity-40"
            data-testid={`review-accept-${item.id}`}
          >
            Aceptar
          </button>
          <button
            type="button"
            disabled={!editing}
            onClick={() => onEdit(item.id, draft)}
            className="clinical-interactive rounded-hd-md border border-sky-300/80 bg-white px-2 py-0.5 text-[10px] font-medium text-sky-900 disabled:opacity-40"
            data-testid={`review-edit-${item.id}`}
          >
            Guardar edición
          </button>
          <button
            type="button"
            disabled={item.decision === "discarded"}
            onClick={() => onDiscard(item.id)}
            className="clinical-interactive rounded-hd-md border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 disabled:opacity-40"
            data-testid={`review-discard-${item.id}`}
          >
            Descartar
          </button>
        </div>
      </div>
      <label className="sr-only" htmlFor={`review-text-${item.id}`}>
        Texto revisable {item.label}
      </label>
      <textarea
        id={`review-text-${item.id}`}
        value={draft}
        disabled={item.decision === "discarded"}
        onChange={(e) => setDraft(e.target.value)}
        rows={2}
        className="w-full resize-y rounded-hd-md border border-hd-border-subtle bg-white px-2 py-1.5 text-xs leading-snug text-slate-800 outline-none focus:border-primary/40 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </li>
  );
}

export function CopilotReviewSelectionLayer({
  state,
  summary,
  onAccept,
  onDiscard,
  onEdit,
  busy = false,
  error = null,
}: {
  state: ReviewSelectionState | null;
  summary: ReviewSelectionSummary;
  onAccept: (id: string) => void;
  onDiscard: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  busy?: boolean;
  error?: string | null;
}) {
  const items = state?.items ?? [];

  return (
    <section
      aria-label="Review and Selection Layer"
      data-testid="copilot-review-selection-layer"
      className="space-y-hd-3 rounded-hd-md border border-amber-200/70 bg-amber-50/40 px-hd-3 py-hd-3"
    >
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/80">
          EPIC-3 · Close · HITL H1 Review
        </p>
        <h3 className={CLINICAL_SECTION_TITLE}>Review & Selection Layer</h3>
        <p className="text-[11px] text-slate-600">
          H1 vía /ai/runs approve|reject · sesión solo espejo · sin EMR · sin
          regenerar.
        </p>
        {busy ? (
          <p className="text-[11px] text-slate-500">Procesando H1…</p>
        ) : null}
        {error ? (
          <p role="alert" className="text-[11px] text-rose-700">
            {error}
          </p>
        ) : null}
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-600 sm:grid-cols-4">
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">Pendientes</dt>
            <dd>{summary.pending}</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">Aceptados</dt>
            <dd>{summary.accepted}</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">Editados</dt>
            <dd>{summary.edited}</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">Descartados</dt>
            <dd>{summary.discarded}</dd>
          </div>
        </dl>
        <p className="text-[10px] text-slate-500">
          Observacionales (solo lectura):{" "}
          {REVIEW_OBSERVATIONAL_SECTION_IDS.join(", ")}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-[11px] text-slate-500">
          No hay ítems EPIC-3 seleccionables en la sesión actual.
        </p>
      ) : (
        <ul className="space-y-hd-2">
          {items.map((item) => (
            <ReviewItemCard
              key={item.id}
              item={item}
              onAccept={onAccept}
              onDiscard={onDiscard}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}

      <p className="font-mono text-[10px] text-slate-400">
        sessionId: {state?.sessionId ?? "(sin sesión)"} · persistsToEmr: false ·
        generatesContent: false
      </p>
    </section>
  );
}
