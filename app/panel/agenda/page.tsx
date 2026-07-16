"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AgendaAvailabilityPanel } from "@/components/agenda/AgendaAvailabilityPanel";
import { AgendaAvailabilityRulesPanel } from "@/components/agenda/AgendaAvailabilityRulesPanel";
import { AgendaDayView } from "@/components/agenda/AgendaDayView";
import { AgendaMonthView } from "@/components/agenda/AgendaMonthView";
import { AgendaWeekView } from "@/components/agenda/AgendaWeekView";
import { AppointmentFormModal } from "@/components/agenda/AppointmentFormModal";
import Button from "@/components/ui/Button";
import {
  type AgendaView,
  getRangeForView,
  getViewTitle,
  navigateAnchor,
  resolveClinicTimezone,
} from "@/lib/agenda/calendar-utils";
import { useAvailabilityEnterpriseQuery } from "@/lib/hooks/use-availability-enterprise";
import { useAppointmentsListQuery } from "@/lib/hooks/use-panel-list-queries";
import { useAuth } from "@/lib/context/AuthContext";
import type { Appointment } from "@/lib/services/appointments";
import { cn } from "@/lib/utils";

const VIEWS: { id: AgendaView; label: string }[] = [
  { id: "month", label: "Mes" },
  { id: "week", label: "Semana" },
  { id: "day", label: "Día" },
];

export default function AgendaPage() {
  const timeZone = resolveClinicTimezone();
  const { user } = useAuth();
  const [view, setView] = useState<AgendaView>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createAt, setCreateAt] = useState<Date | undefined>();

  const range = useMemo(() => getRangeForView(anchor, view), [anchor, view]);
  const { data, isLoading, isFetching, refetch } = useAppointmentsListQuery({
    from: range.from,
    to: range.to,
    limit: 500,
  });

  const availability = useAvailabilityEnterpriseQuery({
    from: range.from,
    to: range.to,
    anchorIso: anchor.toISOString(),
    clinicTimezone: timeZone,
    view,
  });

  const appointments = data?.data ?? [];
  const total = data?.total ?? 0;
  const requiresDoctorId = user?.role === "admin";

  const openCreate = (day?: Date) => {
    setSelected(null);
    setCreateAt(day ?? anchor);
    setModalOpen(true);
  };

  const openEdit = (appointment: Appointment) => {
    setSelected(appointment);
    setCreateAt(undefined);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-primary"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Agenda médica
          </h1>
          <p className="mt-1 text-sm text-primaryDark/70">
            Agenda enterprise · zona horaria {timeZone}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => openCreate()}
            className="rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva cita
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg border border-hd-border-default bg-hd-surface-chrome text-primaryDark hover:bg-hd-surface-muted hover:scale-100"
          >
            {isFetching ? "Actualizando…" : "Actualizar"}
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => setAnchor((d) => navigateAnchor(d, view, -1))}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setAnchor(new Date())}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primaryLight dark:hover:bg-slate-800"
          >
            Hoy
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => setAnchor((d) => navigateAnchor(d, view, 1))}
            className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <h2 className="ml-2 text-lg font-semibold capitalize text-slate-800 dark:text-slate-100">
            {getViewTitle(anchor, view, timeZone)}
          </h2>
        </div>
        <div className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-600">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition",
                view === v.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <AgendaAvailabilityPanel
        summary={availability.data?.summary}
        isLoading={availability.isLoading}
        isError={availability.isError}
        clinicTimezone={timeZone}
        requiresDoctorId={requiresDoctorId}
      />

      <AgendaAvailabilityRulesPanel
        rules={availability.data?.rules}
        isLoading={availability.isLoading}
        isError={availability.isError}
        canManage={!requiresDoctorId}
      />

      {isLoading ? (
        <p className="text-slate-500 dark:text-slate-400">Cargando agenda…</p>
      ) : (
        <>
          {view === "month" && (
            <AgendaMonthView
              anchor={anchor}
              appointments={appointments}
              timeZone={timeZone}
              onSelectAppointment={openEdit}
              onSelectDay={(day) => {
                setAnchor(day);
                setView("day");
              }}
            />
          )}
          {view === "week" && (
            <AgendaWeekView
              anchor={anchor}
              appointments={appointments}
              timeZone={timeZone}
              onSelectAppointment={openEdit}
            />
          )}
          {view === "day" && (
            <AgendaDayView
              anchor={anchor}
              appointments={appointments}
              timeZone={timeZone}
              onSelectAppointment={openEdit}
            />
          )}
        </>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {total} cita(s) en el rango visible
      </p>

      <AppointmentFormModal
        open={modalOpen}
        appointment={selected}
        defaultStartsAt={createAt}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
      />
    </div>
  );
}
