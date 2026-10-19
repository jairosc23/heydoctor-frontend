"use client";

/**
 * ConfirmationMount del Clinical Authority Spine (D6).
 * Representa el punto de confirmación clínica. No ejecuta Confirm,
 * Authorize, HAB ni Emission.
 */
export function ConfirmationMount({ actClass }: { actClass: string }) {
  return (
    <div
      data-testid={`clinical-authority-confirmation-mount-${actClass}`}
      className="mt-3 space-y-2 rounded-hd-md border border-amber-200 bg-amber-50/80 px-hd-3 py-hd-2"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h5 className="text-xs font-semibold text-amber-950">
          Punto de confirmación clínica
        </h5>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-800">
          Emisión no disponible
        </span>
      </div>
      <p className="text-xs text-amber-900">
        ConfirmationMount del Clinical Authority Spine. No confirma, no
        autoriza y no emite.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled
          data-testid={`clinical-authority-confirm-${actClass}`}
          className="rounded-md bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
        >
          Confirmar
        </button>
        <button
          type="button"
          disabled
          data-testid={`clinical-authority-authorize-${actClass}`}
          className="rounded-md border border-amber-800 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 disabled:opacity-40"
        >
          Autorizar
        </button>
      </div>
    </div>
  );
}
