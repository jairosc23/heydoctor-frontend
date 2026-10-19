"use client";

import { formatInClinic } from "@/lib/agenda/calendar-utils";
import type { AvailabilitySummary } from "@/lib/agenda/availability-summary";

type Props = {
  summary: AvailabilitySummary | undefined;
  isLoading: boolean;
  isError: boolean;
  clinicTimezone: string;
  /** Admin without doctorId — Phase 1 shows guidance only. */
  requiresDoctorId?: boolean;
};

export function AgendaAvailabilityPanel({
  summary,
  isLoading,
  isError,
  clinicTimezone,
  requiresDoctorId,
}: Props) {
  if (requiresDoctorId) {
    return (
      <section
        className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
        aria-label="Disponibilidad enterprise"
      >
        <p className="font-semibold">Disponibilidad enterprise</p>
        <p className="mt-1 text-amber-900/80 dark:text-amber-100/80">
          Como administrador, seleccione un médico para consultar reglas y
          slots (Fases siguientes). El motor de disponibilidad del backend ya
          está activo.
        </p>
      </section>
    );
  }

  if (isLoading && !summary) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        Cargando disponibilidad enterprise…
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100">
        No se pudo cargar la disponibilidad. El calendario de citas sigue
        operativo.
      </section>
    );
  }

  if (!summary) return null;

  const enterprise = summary.mode === "enterprise_rules";

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-soft dark:border-slate-700 dark:bg-slate-900"
      aria-label="Disponibilidad enterprise"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Disponibilidad enterprise
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            SSOT backend ·{" "}
            {enterprise
              ? "reglas activas del médico"
              : "horario fallback clínica 07:00–21:00 (sin reglas)"}
          </p>
        </div>
        <span
          className={
            enterprise
              ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
              : "inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          }
        >
          {enterprise ? "Reglas enterprise" : "Fallback"}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">
            Reglas activas
          </dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-100">
            {summary.activeRules}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">
            Slots libres (rango)
          </dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-100">
            {summary.freeSlotsInRange}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-xs text-slate-500 dark:text-slate-400">
            Próximo slot
          </dt>
          <dd className="font-semibold text-slate-800 dark:text-slate-100">
            {summary.nextSlotStartsAt
              ? formatInClinic(
                  summary.nextSlotStartsAt,
                  clinicTimezone,
                  "EEE d MMM HH:mm",
                )
              : "—"}
          </dd>
        </div>
      </dl>

      {summary.weeklyWindows.length > 0 ? (
        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            Ventanas:{" "}
          </span>
          {summary.weeklyWindows.slice(0, 8).join(" · ")}
          {summary.weeklyWindows.length > 8
            ? ` · +${summary.weeklyWindows.length - 8}`
            : ""}
        </p>
      ) : null}
    </section>
  );
}
