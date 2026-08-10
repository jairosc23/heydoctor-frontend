"use client";

import { CLINICAL_OVERLAY_Z } from "@/lib/clinical-overlay-contract";

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
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-slate-900/40 px-4"
      style={{ zIndex: CLINICAL_OVERLAY_Z.system }}
      role="presentation"
      data-testid="unsaved-changes-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
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
