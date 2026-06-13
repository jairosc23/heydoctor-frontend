"use client";

import { useEffect } from "react";
import { clinicalActionModuleLabel } from "@/lib/clinical-action-workspace";
import {
  CLINICAL_OVERLAY_BACKDROP_CLASS,
  CLINICAL_OVERLAY_PANEL_CLASS,
} from "@/lib/clinical-overlay-contract";
import { cn } from "@/lib/utils";
import { useClinicalActionWorkspace } from "./ClinicalActionWorkspaceProvider";

export function ClinicalModuleSheet() {
  const { enabled, activeModule, sheetOpen, closeSheet } =
    useClinicalActionWorkspace();

  useEffect(() => {
    if (!enabled || !sheetOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSheet();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enabled, sheetOpen, closeSheet]);

  if (!enabled || !sheetOpen || !activeModule) return null;

  const moduleLabel = clinicalActionModuleLabel(activeModule);

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar módulo clínico"
        className={cn(
          "clinical-drawer-enter fixed inset-0 bg-slate-900/15",
          CLINICAL_OVERLAY_BACKDROP_CLASS.module,
        )}
        onClick={closeSheet}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Clinical Module Sheet — ${moduleLabel}`}
        data-testid="clinical-module-sheet"
        data-module={activeModule}
        className={cn(
          "clinical-drawer-enter clinical-module-sheet fixed bottom-0 right-0 flex flex-col",
          "border-l border-hd-border-subtle bg-hd-surface-chrome shadow-hd-3",
          CLINICAL_OVERLAY_PANEL_CLASS.module,
        )}
      >
        <header className="relative shrink-0 border-b border-hd-border-subtle px-hd-4 py-hd-3">
          <div className="heydoctor-presence pr-8">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
              Phase 4.2.0 Shell
            </p>
            <h2 className="text-sm font-semibold text-slate-900">
              Clinical Module Sheet™
            </h2>
            <p className="text-[10px] text-slate-500">{moduleLabel}</p>
          </div>
          <button
            type="button"
            onClick={closeSheet}
            aria-label="Cerrar panel"
            className="clinical-interactive absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-hd-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-hd-4 py-hd-4">
          <div className="rounded-hd-md border border-dashed border-hd-border-subtle bg-hd-surface-muted/50 px-hd-4 py-hd-5 text-sm text-slate-600">
            <p className="font-medium text-slate-800">
              Contenedor shell — {moduleLabel}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Phase 4.2.0 no migra contenido clínico. Las órdenes, recetas y
              documentos permanecen en el rail derecho legacy hasta Phase 4.2.1+.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
