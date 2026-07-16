"use client";

import type { ReactNode } from "react";
import { AgendaDashboardKpiCard } from "@/components/agenda/AgendaDashboardKpiCard";
import { AgendaSkeleton } from "@/components/agenda/AgendaSkeleton";
import { AgendaStatusBadge } from "@/components/agenda/AgendaStatusBadge";
import {
  formatHoursLabel,
  type AgendaDashboardMetrics,
} from "@/lib/agenda/agenda-dashboard-metrics";
import { formatInClinic } from "@/lib/agenda/calendar-utils";
import { patientLabel } from "@/lib/agenda/appointment-display";

type Props = {
  metrics: AgendaDashboardMetrics;
  isLoading: boolean;
  clinicTimezone: string;
  clinicName?: string;
};

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h3>
      <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

/** Read-only executive dashboard over certified Agenda Enterprise SSOT data. */
export function AgendaDashboardPanel({
  metrics,
  isLoading,
  clinicTimezone,
  clinicName,
}: Props) {
  if (isLoading) {
    return <AgendaSkeleton rows={5} label="Cargando dashboard enterprise" />;
  }

  return (
    <div
      className="space-y-4"
      aria-label="Dashboard Agenda Enterprise"
    >
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Dashboard ejecutivo
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Solo lectura · métricas derivadas del SSOT ya cargado
              {clinicName ? ` · ${clinicName}` : ""}
            </p>
          </div>
          <AgendaStatusBadge
            label="Estado"
            value={metrics.healthLabel}
            tone={metrics.healthTone}
            title={metrics.healthHint}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">{metrics.healthHint}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AgendaDashboardKpiCard
          title="Citas en rango"
          value={metrics.totalAppointments}
          hint="Listado de appointments del periodo visible"
          tone="info"
        />
        <AgendaDashboardKpiCard
          title="Horas disponibles"
          value={formatHoursLabel(metrics.freeHoursApprox)}
          hint={`${metrics.freeSlotCount} slot(s) libres`}
          tone="success"
        />
        <AgendaDashboardKpiCard
          title="Horas ocupadas"
          value={formatHoursLabel(metrics.occupiedHoursApprox)}
          hint="Suma de duración de citas no canceladas"
          tone="warning"
        />
        <AgendaDashboardKpiCard
          title="Lista de espera"
          value={metrics.waitlistActive}
          hint={`${metrics.waitlistTotal} entradas en rango`}
          tone={metrics.waitlistActive > 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <SummaryCard title="Today's / overview de agenda">
          <p>
            Próximas citas:{" "}
            <strong className="text-slate-800 dark:text-slate-100">
              {metrics.upcomingAppointments.length}
            </strong>
          </p>
          {metrics.upcomingAppointments.length === 0 ? (
            <p className="text-xs text-slate-500">Sin próximas citas futuras en el rango.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {metrics.upcomingAppointments.map((a) => (
                <li key={a.id} className="flex justify-between gap-2 py-2 text-xs">
                  <span className="truncate font-medium text-slate-800 dark:text-slate-100">
                    {patientLabel(a)}
                  </span>
                  <span className="shrink-0 tabular-nums text-slate-500">
                    {a.startsAt
                      ? formatInClinic(
                          a.startsAt,
                          clinicTimezone,
                          "EEE d MMM HH:mm",
                        )
                      : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SummaryCard>

        <SummaryCard title="Availability summary">
          <p>
            Modo:{" "}
            <strong>
              {metrics.availabilityMode === "enterprise_rules"
                ? "Reglas enterprise"
                : metrics.availabilityMode === "fallback_hours"
                  ? "Fallback 07:00–21:00"
                  : "N/D"}
            </strong>
          </p>
          <p>
            Reglas activas: {metrics.activeRules} / {metrics.totalRules}
          </p>
          <p>Slots libres: {metrics.freeSlotCount}</p>
          <p>
            Próximo slot:{" "}
            {metrics.nextFreeSlotAt
              ? formatInClinic(
                  metrics.nextFreeSlotAt,
                  clinicTimezone,
                  "EEE d MMM HH:mm",
                )
              : "—"}
          </p>
          {metrics.weeklyWindows.length > 0 ? (
            <ul className="mt-1 list-disc pl-4 text-xs text-slate-500">
              {metrics.weeklyWindows.slice(0, 6).map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}
        </SummaryCard>

        <SummaryCard title="Blocks summary">
          <p>
            Bloques activos: <strong>{metrics.activeBlocks}</strong>
          </p>
          <p>Total en rango: {metrics.totalBlocks}</p>
        </SummaryCard>

        <SummaryCard title="Waitlist summary">
          <p>
            Activos: <strong>{metrics.waitlistActive}</strong>
          </p>
          <p>Total listados: {metrics.waitlistTotal}</p>
        </SummaryCard>

        <SummaryCard title="Reminder summary">
          <p>Pendientes (scheduled): {metrics.remindersScheduled}</p>
          <p>Enviados (sent): {metrics.remindersSent}</p>
          <p>Fallidos: {metrics.remindersFailed}</p>
          <p>
            Políticas activas: {metrics.reminderPoliciesActive} /{" "}
            {metrics.reminderPoliciesTotal}
          </p>
        </SummaryCard>

        <SummaryCard title="Rules & timezone">
          <p>
            Reglas activas: <strong>{metrics.activeRules}</strong>
          </p>
          <p>
            Timezone clínica:{" "}
            <strong className="break-all">{metrics.timezone}</strong>
          </p>
          <p className="text-xs text-slate-500">
            Fuente: {metrics.timezoneSource}
          </p>
        </SummaryCard>
      </div>
    </div>
  );
}
