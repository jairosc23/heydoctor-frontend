"use client";

/**
 * E05 fail-closed UX — physician-visible unbound / error banner.
 * Does not invent authority; reflects BE binding status.
 */
export function ClinicalContextBanner({
  status,
  error,
  onRetryBind,
}: {
  status: "idle" | "loading" | "bound" | "unbound" | "error";
  error?: string | null;
  onRetryBind?: () => void;
}) {
  if (status === "bound" || status === "idle" || status === "loading") {
    return null;
  }

  const unbound = status === "unbound";
  return (
    <div
      data-testid="clinical-context-banner"
      role="alert"
      className="flex flex-wrap items-center gap-2 border-b border-amber-300/80 bg-amber-50 px-3 py-2 text-xs text-amber-950"
    >
      <span className="font-medium">
        {unbound
          ? "Contexto clínico no vinculado"
          : "Error de contexto clínico"}
      </span>
      <span className="text-amber-900/80">
        {unbound
          ? "La asistencia clínica está bloqueada hasta vincular el encuentro (fail-closed)."
          : (error ?? "No se pudo verificar el vínculo de contexto.")}
      </span>
      {onRetryBind ? (
        <button
          type="button"
          data-testid="clinical-context-bind-retry"
          className="rounded border border-amber-400 bg-white px-2 py-0.5 font-medium text-amber-950"
          onClick={onRetryBind}
        >
          Vincular contexto
        </button>
      ) : null}
    </div>
  );
}
