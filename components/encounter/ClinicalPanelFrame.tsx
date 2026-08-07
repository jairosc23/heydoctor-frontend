"use client";

import type { ReactNode } from "react";
import type { ClinicalPanelUiState } from "@/lib/encounter/clinical-panel-ui";

/**
 * Shared clinical panel chrome — deterministic loading | empty | ready.
 * No blank cards: empty always explains why.
 */
export function ClinicalPanelFrame({
  state,
  label,
  loadingLabel = "Cargando contexto clínico…",
  emptyTitle,
  emptyDescription,
  children,
  testId,
}: {
  state: ClinicalPanelUiState;
  label: string;
  loadingLabel?: string;
  emptyTitle: string;
  emptyDescription: string;
  children?: ReactNode;
  testId?: string;
}) {
  return (
    <section
      aria-label={label}
      data-testid={testId}
      data-ui-state={state}
      className="space-y-hd-3"
    >
      {state === "loading" ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-hd-md border border-dashed border-slate-200 bg-slate-50/80 px-hd-3 py-hd-3"
        >
          <p className="text-[11px] text-slate-600">{loadingLabel}</p>
          <div className="mt-2 space-y-2" aria-hidden>
            <div className="h-8 animate-pulse rounded-hd-md bg-slate-200/80" />
            <div className="h-8 animate-pulse rounded-hd-md bg-slate-200/70" />
          </div>
        </div>
      ) : null}

      {state === "empty" ? (
        <div
          role="status"
          className="rounded-hd-md border border-dashed border-slate-200 bg-slate-50/80 px-hd-3 py-hd-3"
          data-testid={testId ? `${testId}-empty` : undefined}
        >
          <p className="text-[12px] font-medium text-slate-700">{emptyTitle}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            {emptyDescription}
          </p>
        </div>
      ) : null}

      {state === "ready" ? children : null}
    </section>
  );
}
