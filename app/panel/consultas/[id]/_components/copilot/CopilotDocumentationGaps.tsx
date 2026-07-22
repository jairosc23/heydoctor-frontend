"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type { DocumentationGap } from "@/lib/clinical-copilot-intelligence";

export type DocumentationGapsSyncState =
  | "loading"
  | "unsaved_changes"
  | "synced"
  | "unavailable";

export function CopilotDocumentationGaps({
  gaps,
  syncState = "synced",
}: {
  gaps: DocumentationGap[];
  syncState?: DocumentationGapsSyncState;
}) {
  const statusLine =
    syncState === "loading"
      ? "Actualizando pendientes…"
      : syncState === "unsaved_changes"
        ? "Hay cambios sin guardar. Los pendientes se actualizan al guardar."
        : syncState === "unavailable"
          ? "Pendientes no disponibles todavía."
          : "Según la última versión guardada.";

  return (
    <section
      aria-label="Pendientes de documentación"
      className="space-y-hd-2"
      data-testid="documentation-gaps-panel"
    >
      <div>
        <h3 className={CLINICAL_SECTION_TITLE}>
          Pendientes de documentación
        </h3>
        <p className="text-[11px] text-slate-500">
          Oportunidades de completitud — informativo
        </p>
        <p
          className="mt-1 text-[11px] font-medium text-slate-600"
          data-testid="documentation-gaps-sync-status"
        >
          {statusLine}
        </p>
      </div>
      {syncState === "loading" ? (
        <p className="rounded-hd-md border border-slate-200/80 bg-slate-50/80 px-hd-3 py-hd-2 text-[11px] text-slate-600">
          Actualizando pendientes de documentación…
        </p>
      ) : gaps.length === 0 ? (
        <p
          className="rounded-hd-md border border-emerald-200/80 bg-emerald-50/40 px-hd-3 py-hd-2 text-[11px] text-emerald-900"
          data-testid="documentation-gaps-empty"
        >
          No hay pendientes de documentación con los datos guardados.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {gaps.map((gap) => (
            <li
              key={gap.id}
              className="rounded-hd-md border border-slate-200/80 bg-slate-50/80 px-hd-3 py-hd-2"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {gap.field}
              </p>
              <p className="text-xs text-slate-700">{gap.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
