"use client";

import { useState } from "react";
import type { PassiveContinuityHint } from "@/lib/continuity-platform/types";

export function ContinuityHintsSection({
  hints,
  loading,
}: {
  hints: PassiveContinuityHint[];
  loading?: boolean;
}) {
  const sorted = [...hints].sort((a, b) => a.priorityRank - b.priorityRank);

  return (
    <section data-testid="continuity-hints-section" className="space-y-1.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Sugerencias pasivas
      </h3>
      {loading ? (
        <p className="text-xs text-slate-400">Cargando…</p>
      ) : sorted.length === 0 ? (
        <p className="text-xs text-slate-500">Sin sugerencias de continuidad.</p>
      ) : (
        <ul className="space-y-1">
          {sorted.map((hint) => (
            <HintRow key={hint.hintId} hint={hint} />
          ))}
        </ul>
      )}
    </section>
  );
}

function HintRow({ hint }: { hint: PassiveContinuityHint }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <li className="rounded-md border border-slate-100 bg-white px-2.5 py-1.5 text-xs text-slate-700">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-2 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span>
          <span className="font-medium">{hint.title}</span>
          <span className="mt-0.5 block text-[11px] text-slate-500">
            {hint.sourceKind} · {hint.provenance.kind}
          </span>
        </span>
        <span className="text-slate-400">{expanded ? "▾" : "▸"}</span>
      </button>
      {expanded && hint.summary ? (
        <p className="mt-1.5 text-[11px] text-slate-600">{hint.summary}</p>
      ) : null}
      {/* C1: Composer CTA intentionally absent */}
    </li>
  );
}
