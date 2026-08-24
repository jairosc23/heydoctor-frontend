"use client";

import { useEffect } from "react";
import { CLINICAL_OVERLAY_CLASS } from "@/lib/clinical-overlay-contract";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";
import { cn } from "@/lib/utils";

export function UnsavedChangesDialog({
  open,
  saving = false,
  error = null,
  onCancel,
  onSaveAndExit,
  onExitWithoutSaving,
}: {
  open: boolean;
  saving?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSaveAndExit: () => void;
  onExitWithoutSaving: () => void;
}) {
  useEffect(() => {
    if (!open) {
      clinicalWorkspaceKernel.dismiss("unsaved");
      return;
    }
    clinicalWorkspaceKernel.present({
      id: "unsaved",
      kind: "dialog",
      blocking: true,
      onDismiss: onCancel,
      backdropAriaLabel: "Cancelar",
      backdropClassName: "bg-slate-900/40",
    });
  }, [open, onCancel]);

  useEffect(() => {
    return () => {
      clinicalWorkspaceKernel.dismiss("unsaved");
    };
  }, []);

  if (!open) return null;

  const viewport = clinicalWorkspaceKernel.getViewport();

  return (
    <div
      className={cn(
        "clinical-overlay-clinical-content pointer-events-none flex items-center justify-center px-4",
        CLINICAL_OVERLAY_CLASS.dialog,
      )}
      style={{
        paddingTop: viewport.safeTop,
        paddingBottom: viewport.safeBottom,
      }}
      role="presentation"
      data-testid="unsaved-changes-backdrop"
      data-unsaved-host="overlayHost"
      data-overlay-layer="dialog"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        className="pointer-events-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
        data-testid="unsaved-changes-dialog"
      >
        <h2
          id="unsaved-changes-title"
          className="m-0 text-base font-semibold text-slate-900"
        >
          Cambios sin guardar
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Hay cambios pendientes en la ficha clínica. ¿Qué desea hacer?
        </p>
        {error ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            data-testid="unsaved-changes-cancel"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onExitWithoutSaving}
            disabled={saving}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            data-testid="unsaved-changes-discard"
          >
            Salir sin guardar
          </button>
          <button
            type="button"
            onClick={onSaveAndExit}
            disabled={saving}
            className="rounded-lg border-0 bg-[#078A92] px-3 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            data-testid="unsaved-changes-save"
          >
            {saving ? "Guardando…" : "Guardar y salir"}
          </button>
        </div>
      </div>
    </div>
  );
}
