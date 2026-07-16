"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AgendaAvailabilityPanel } from "@/components/agenda/AgendaAvailabilityPanel";
import { AgendaAvailabilityRulesPanel } from "@/components/agenda/AgendaAvailabilityRulesPanel";
import { AgendaBlocksPanel } from "@/components/agenda/AgendaBlocksPanel";
import { AgendaDayView } from "@/components/agenda/AgendaDayView";
import { AgendaMonthView } from "@/components/agenda/AgendaMonthView";
import { AgendaSlotsPanel } from "@/components/agenda/AgendaSlotsPanel";
import { AgendaWeekView } from "@/components/agenda/AgendaWeekView";
import { AppointmentFormModal } from "@/components/agenda/AppointmentFormModal";
import Button from "@/components/ui/Button";
import { collectClinicDoctorOptions } from "@/lib/agenda/appointment-display";
import {
  type AgendaView,
  formatInClinic,
  getRangeForView,
  getViewTitle,
  navigateAnchor,
  resolveClinicTimezone,
} from "@/lib/agenda/calendar-utils";
import { useAvailabilityEnterpriseQuery } from "@/lib/hooks/use-availability-enterprise";
import {
  useAppointmentsListQuery,
  useConsultationsListQuery,
} from "@/lib/hooks/use-panel-list-queries";
import { useScheduleBlocksQuery } from "@/lib/hooks/use-schedule-blocks";
import { useAuth } from "@/lib/context/AuthContext";
import type { Appointment } from "@/lib/services/appointments";
import { cn } from "@/lib/utils";

const VIEWS: { id: AgendaView; label: string }[] = [
  { id: "month", label: "Mes" },
  { id: "week", label: "Semana" },
  { id: "day", label: "Día" },
];

const SLOT_MINUTES_OPTIONS = [15, 30, 45, 60] as const;

export default function AgendaPage() {
  const timeZone = resolveClinicTimezone();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [view, setView] = useState<AgendaView>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createAt, setCreateAt] = useState<Date | undefined>();
  const [doctorFilter, setDoctorFilter] = useState("");
  const [slotMinutes, setSlotMinutes] = useState<(typeof SLOT_MINUTES_OPTIONS)[number]>(30);

  const range = useMemo(() => getRangeForView(anchor, view), [anchor, view]);

  const { data: consultationsData } = useConsultationsListQuery(
    { limit: 100 },
    { enabled: isAdmin },
  );

  const appointmentFilters = useMemo(
    () => ({
      from: range.from,
      to: range.to,
      limit: 500,
      ...(isAdmin && doctorFilter ? { doctorId: doctorFilter } : {}),
    }),
    [range.from, range.to, isAdmin, doctorFilter],
  );

  const { data, isLoading, isFetching, refetch } =
    useAppointmentsListQuery(appointmentFilters);

  /** Unfiltered list (same range) to populate admin doctor selector. */
  const { data: clinicAppointmentsData } = useAppointmentsListQuery(
    { from: range.from, to: range.to, limit: 500 },
    { enabled: isAdmin },
  );

  const availability = useAvailabilityEnterpriseQuery({
    from: range.from,
    to: range.to,
    anchorIso: anchor.toISOString(),
    clinicTimezone: timeZone,
    view,
    doctorId: isAdmin ? doctorFilter || undefined : undefined,
    slotMinutes,
  });

  const blocksQuery = useScheduleBlocksQuery({
    from: range.from,
    to: range.to,
    doctorId: isAdmin ? doctorFilter || undefined : undefined,
  });

  const appointments = data?.data ?? [];
  const total = data?.total ?? 0;
  const requiresDoctorId = isAdmin && !doctorFilter;

  const doctorOptions = useMemo(
    () =>
      collectClinicDoctorOptions(
        clinicAppointmentsData?.data ?? appointments,
        (consultationsData?.data ?? [])
          .filter((c) => Boolean(c.doctorId))
          .map((c) => ({ id: c.doctorId as string, label: undefined })),
      ),
    [clinicAppointmentsData?.data, appointments, consultationsData?.data],
  );

  const slotRangeLabel = availability.data?.slotRange
    ? `${formatInClinic(availability.data.slotRange.from, timeZone, "d MMM HH:mm")} – ${formatInClinic(availability.data.slotRange.to, timeZone, "d MMM HH:mm")}`
    : undefined;

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

  const openOccupied = (appointmentId: string) => {
    const found = appointments.find((a) => a.id === appointmentId);
    if (found) openEdit(found);
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
            {user?.clinicId
              ? ` · clínica ${user.clinicId.slice(0, 8)}…`
              : ""}
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
            onClick={() => {
              void refetch();
              void availability.refetch();
            }}
            disabled={isFetching || availability.isFetching}
            className="rounded-lg border border-hd-border-default bg-hd-surface-chrome text-primaryDark hover:bg-hd-surface-muted hover:scale-100"
          >
            {isFetching || availability.isFetching
              ? "Actualizando…"
              : "Actualizar"}
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          {isAdmin ? (
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Profesional
              <select
                className="mt-1 block min-w-[12rem] rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
              >
                <option value="">Seleccionar médico…</option>
                {doctorOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Duración slot
            <select
              className="mt-1 block rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
              value={slotMinutes}
              onChange={(e) =>
                setSlotMinutes(
                  Number(e.target.value) as (typeof SLOT_MINUTES_OPTIONS)[number],
                )
              }
            >
              {SLOT_MINUTES_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </label>
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

      <AgendaSlotsPanel
        freeSlots={availability.data?.slots}
        appointments={appointments}
        clinicTimezone={timeZone}
        clinicId={user?.clinicId}
        doctorId={
          isAdmin ? doctorFilter || undefined : availability.data?.resolvedDoctorId
        }
        isLoading={availability.isLoading}
        isError={availability.isError}
        canQuery={!requiresDoctorId}
        slotRangeLabel={slotRangeLabel}
        onSelectFreeSlot={(startsAt) => openCreate(startsAt)}
        onSelectOccupied={openOccupied}
      />

      <AgendaBlocksPanel
        blocks={blocksQuery.data}
        isLoading={blocksQuery.isLoading}
        isError={blocksQuery.isError}
        clinicTimezone={timeZone}
        clinicId={user?.clinicId}
        doctorOptions={doctorOptions}
        defaultDoctorId={doctorFilter}
        canManage={user?.role === "doctor" || isAdmin}
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
        {total} cita(s) vigente(s) en el rango visible
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
