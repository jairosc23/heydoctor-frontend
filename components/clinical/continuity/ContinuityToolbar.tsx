"use client";

import { cn } from "@/lib/utils";
import type { ContinuityPanelUiState } from "./continuity-panel.types";
import { canRefresh, canRetry } from "./continuity-panel-state";

export function ContinuityToolbar({
  uiState,
  onRefresh,
  onDismiss,
  onRetry,
}: {
  uiState: ContinuityPanelUiState;
  onRefresh: () => void;
  onDismiss: () => void;
  onRetry: () => void;
}) {
  const refreshing = uiState === "Refreshing" || uiState === "Loading";
  const showRetry = canRetry(uiState);
  const showRefresh = canRefresh(uiState);

  return (
    <div
      className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2"
      data-testid="continuity-toolbar"
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">
          Encounter Timeline
        </p>
        <p className="text-[11px] text-slate-500">
          Continuity del encuentro · mismo Clinical Snapshot · solo lectura
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        {showRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Reintentar
          </button>
        ) : null}
        {showRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className={cn(
              "rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50",
              refreshing && "opacity-50",
            )}
          >
            Actualizar
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar Continuity"
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
