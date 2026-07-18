"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { AgendaAvailabilityPanel } from "@/components/agenda/AgendaAvailabilityPanel";
import { AgendaAvailabilityRulesPanel } from "@/components/agenda/AgendaAvailabilityRulesPanel";
import { AgendaBlocksPanel } from "@/components/agenda/AgendaBlocksPanel";
import { AgendaCollapsible } from "@/components/agenda/AgendaCollapsible";
import { AgendaDashboardPanel } from "@/components/agenda/AgendaDashboardPanel";
import { AgendaDayView } from "@/components/agenda/AgendaDayView";
import { AgendaMonthView } from "@/components/agenda/AgendaMonthView";
import { AgendaSkeleton } from "@/components/agenda/AgendaSkeleton";
import { AgendaSlotsPanel } from "@/components/agenda/AgendaSlotsPanel";
import { AgendaRemindersPanel } from "@/components/agenda/AgendaRemindersPanel";
import { AgendaStatusBadge } from "@/components/agenda/AgendaStatusBadge";
import { AgendaTimezonePanel } from "@/components/agenda/AgendaTimezonePanel";
import { AgendaWaitlistPanel } from "@/components/agenda/AgendaWaitlistPanel";
import { AgendaWeekView } from "@/components/agenda/AgendaWeekView";
import { AgendaWorkspaceNav } from "@/components/agenda/AgendaWorkspaceNav";
import { AppointmentFormModal } from "@/components/agenda/AppointmentFormModal";
import Button from "@/components/ui/Button";
import { buildAgendaDashboardMetrics } from "@/lib/agenda/agenda-dashboard-metrics";
import { collectClinicDoctorOptions } from "@/lib/agenda/appointment-display";
import type { AgendaWorkspaceTab } from "@/lib/agenda/agenda-workspace";
import {
  type AgendaView,
  formatInClinic,
  getRangeForView,
  getViewTitle,
  navigateAnchor,
} from "@/lib/agenda/calendar-utils";
import { useAvailabilityEnterpriseQuery } from "@/lib/hooks/use-availability-enterprise";
import {
  useDoctorTimezoneQuery,
  useResolvedClinicTimezone,
} from "@/lib/hooks/use-clinic-timezone";
import {
  useAppointmentsListQuery,
  useConsultationsListQuery,
} from "@/lib/hooks/use-panel-list-queries";
import {
  useReminderPoliciesQuery,
  useRemindersQuery,
} from "@/lib/hooks/use-appointment-reminders";
import { useScheduleBlocksQuery } from "@/lib/hooks/use-schedule-blocks";
import { useWaitlistEntriesQuery } from "@/lib/hooks/use-waitlist-entries";
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
  const queryClient = useQueryClient();
  const {
    timeZone,
    clinicName,
    source: timezoneSource,
  } = useResolvedClinicTimezone();
  const doctorTzQuery = useDoctorTimezoneQuery();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [workspaceTab, setWorkspaceTab] =
    useState<AgendaWorkspaceTab>("dashboard");
  const [view, setView] = useState<AgendaView>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createAt, setCreateAt] = useState<Date | undefined>();
  const [doctorFilter, setDoctorFilter] = useState("");
  const [slotMinutes, setSlotMinutes] =
    useState<(typeof SLOT_MINUTES_OPTIONS)[number]>(30);
  const [refreshNote, setRefreshNote] = useState<string | null>(null);

  const range = useMemo(() => getRangeForView(anchor, view), [anchor, view]);

  const { data: consultationsData } = useConsultationsListQuery(
    { limit: 100 },
    { enabled: isAdmin },
  );

  // W3 — BE @Max(100); align FE to contract (was 500 → validation 400).
  const appointmentFilters = useMemo(
    () => ({
      from: range.from,
      to: range.to,
      limit: 100,
      ...(isAdmin && doctorFilter ? { doctorId: doctorFilter } : {}),
    }),
    [range.from, range.to, isAdmin, doctorFilter],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useAppointmentsListQuery(appointmentFilters);

  /**
   * F2-09: second list only when admin filtered by doctor — otherwise the
   * primary list already covers the clinic range (avoids duplicate GET).
   */
  const { data: clinicAppointmentsData } = useAppointmentsListQuery(
    { from: range.from, to: range.to, limit: 100 },
    { enabled: isAdmin && Boolean(doctorFilter) },
  );

  // W3 — gate heavy panels by workspace tab (calendar = appointments-only).
  const needAvailability =
    workspaceTab === "dashboard" || workspaceTab === "availability";
  const needBlocks =
    workspaceTab === "dashboard" ||
    workspaceTab === "availability" ||
    workspaceTab === "operations";
  const needWaitlist =
    workspaceTab === "dashboard" || workspaceTab === "operations";
  const needReminders =
    workspaceTab === "dashboard" || workspaceTab === "operations";

  const availability = useAvailabilityEnterpriseQuery({
    from: range.from,
    to: range.to,
    anchorIso: anchor.toISOString(),
    clinicTimezone: timeZone,
    view,
    doctorId: isAdmin ? doctorFilter || undefined : undefined,
    slotMinutes,
    enabled: needAvailability,
  });

  const blocksQuery = useScheduleBlocksQuery({
    from: range.from,
    to: range.to,
    doctorId: isAdmin ? doctorFilter || undefined : undefined,
    enabled: needBlocks,
  });

  const waitlistQuery = useWaitlistEntriesQuery({
    from: range.from,
    to: range.to,
    doctorId: isAdmin ? doctorFilter || undefined : undefined,
    enabled: needWaitlist,
    // Dashboard only needs counts; operations tab needs slot enrich.
    includeMatchingSlots: workspaceTab === "operations",
  });

  const reminderPoliciesQuery = useReminderPoliciesQuery({
    doctorId: isAdmin ? doctorFilter || undefined : undefined,
    enabled: needReminders,
  });

  const remindersQuery = useRemindersQuery({
    from: range.from,
    to: range.to,
    doctorId: isAdmin ? doctorFilter || undefined : undefined,
    enabled: needReminders,
  });

  const appointments = data?.data ?? [];
  const total = data?.total ?? 0;
  const requiresDoctorId = isAdmin && !doctorFilter;
  const freeSlotCount = availability.data?.slots?.length ?? 0;
  const waitlistActiveCount =
    waitlistQuery.data?.filter((e) => e.status === "active").length ?? 0;
  const reminderPendingCount =
    remindersQuery.data?.filter((r) => r.status === "scheduled").length ?? 0;
  const blocksActiveCount =
    blocksQuery.data?.filter((b) => b.isActive !== false).length ?? 0;
  // W3 — header KPIs show em-dash when the tab has not loaded that panel yet.
  const slotsBadge = needAvailability
    ? requiresDoctorId
      ? "—"
      : freeSlotCount
    : "—";
  const blocksBadge = needBlocks ? blocksActiveCount : "—";
  const waitlistBadge = needWaitlist ? waitlistActiveCount : "—";
  const remindersBadge = needReminders ? reminderPendingCount : "—";

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

  const dashboardMetrics = useMemo(
    () =>
      buildAgendaDashboardMetrics({
        appointments,
        slots: availability.data?.slots,
        rules: availability.data?.rules,
        summary: availability.data?.summary,
        blocks: blocksQuery.data,
        waitlist: waitlistQuery.data,
        reminders: remindersQuery.data,
        reminderPolicies: reminderPoliciesQuery.data,
        timezone: timeZone,
        timezoneSource,
        requiresDoctorId,
        hasAppointmentsError: isError,
        hasAvailabilityError: availability.isError,
      }),
    [
      appointments,
      availability.data?.slots,
      availability.data?.rules,
      availability.data?.summary,
      availability.isError,
      blocksQuery.data,
      waitlistQuery.data,
      remindersQuery.data,
      reminderPoliciesQuery.data,
      timeZone,
      timezoneSource,
      requiresDoctorId,
      isError,
    ],
  );

  const refreshing =
    isFetching ||
    availability.isFetching ||
    blocksQuery.isFetching ||
    waitlistQuery.isFetching ||
    remindersQuery.isFetching;

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

  const refreshAll = async () => {
    setRefreshNote(null);
    await Promise.all([
      refetch(),
      availability.refetch(),
      queryClient.invalidateQueries({
        queryKey: ["appointments", "schedule-blocks"],
      }),
      queryClient.invalidateQueries({ queryKey: ["appointments", "waitlist"] }),
      queryClient.invalidateQueries({
        queryKey: ["appointments", "reminders"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["appointments", "reminder-policies"],
      }),
      queryClient.invalidateQueries({ queryKey: ["clinic", "me"] }),
    ]);
    setRefreshNote("Agenda actualizada");
    window.setTimeout(() => setRefreshNote(null), 2500);
  };

  return (
    <div className="space-y-4 p-4 md:space-y-5 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1
            className="text-2xl font-bold text-primary"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Agenda médica
          </h1>
          <p className="mt-1 text-sm text-primaryDark/70">
            Workspace enterprise · {timeZone}
            {clinicName ? ` · ${clinicName}` : ""}
            {user?.clinicId ? ` · clínica ${user.clinicId.slice(0, 8)}…` : ""}
          </p>
          <div
            className="mt-3 flex flex-wrap gap-2"
            aria-label="Indicadores de agenda"
          >
            <AgendaStatusBadge
              label="Citas"
              value={total}
              tone="info"
              title="Citas en el rango visible"
            />
            <AgendaStatusBadge
              label="Slots libres"
              value={slotsBadge}
              tone={
                typeof slotsBadge === "number" && slotsBadge > 0
                  ? "success"
                  : "neutral"
              }
              title="Huecos libres del motor de disponibilidad"
            />
            <AgendaStatusBadge
              label="Bloques"
              value={blocksBadge}
              tone={
                typeof blocksBadge === "number" && blocksBadge > 0
                  ? "warning"
                  : "neutral"
              }
              title="Bloqueos activos"
            />
            <AgendaStatusBadge
              label="Espera"
              value={waitlistBadge}
              tone={
                typeof waitlistBadge === "number" && waitlistBadge > 0
                  ? "warning"
                  : "neutral"
              }
              title="Entradas activas en lista de espera"
            />
            <AgendaStatusBadge
              label="Reminders"
              value={remindersBadge}
              tone={
                typeof remindersBadge === "number" && remindersBadge > 0
                  ? "info"
                  : "neutral"
              }
              title="Recordatorios pendientes (scheduled)"
            />
            {requiresDoctorId ? (
              <AgendaStatusBadge
                label="Admin"
                value="elige médico"
                tone="warning"
                title="Seleccione un profesional para consultar disponibilidad"
              />
            ) : null}
            {isError ? (
              <AgendaStatusBadge
                label="Error"
                value="citas"
                tone="danger"
                title="No se pudieron cargar las citas"
              />
            ) : null}
            {refreshNote ? (
              <AgendaStatusBadge
                label="OK"
                value={refreshNote}
                tone="success"
                title="Sincronización completada"
              />
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => openCreate()}
            className="rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Nueva cita
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void refreshAll()}
            disabled={refreshing}
            title="Actualizar citas, disponibilidad, bloques, waitlist y reminders"
            className="rounded-lg border border-hd-border-default bg-hd-surface-chrome text-primaryDark hover:bg-hd-surface-muted hover:scale-100"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")}
              aria-hidden
            />
            {refreshing ? "Actualizando…" : "Actualizar todo"}
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-label="Periodo anterior"
              title="Periodo anterior"
              onClick={() => setAnchor((d) => navigateAnchor(d, view, -1))}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              title="Ir a hoy"
              onClick={() => setAnchor(new Date())}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-primary hover:bg-primaryLight dark:hover:bg-slate-800"
            >
              Hoy
            </button>
            <button
              type="button"
              aria-label="Periodo siguiente"
              title="Periodo siguiente"
              onClick={() => setAnchor((d) => navigateAnchor(d, view, 1))}
              className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <h2 className="ml-1 text-lg font-semibold capitalize text-slate-800 dark:text-slate-100">
              {getViewTitle(anchor, view, timeZone)}
            </h2>
          </div>
          <div
            className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-600"
            role="group"
            aria-label="Vista de calendario"
          >
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-pressed={view === v.id}
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
                  Number(
                    e.target.value,
                  ) as (typeof SLOT_MINUTES_OPTIONS)[number],
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
          <p className="ml-auto text-xs text-slate-500 dark:text-slate-400">
            {total} cita(s) en rango
            {refreshing ? " · sincronizando…" : ""}
          </p>
        </div>
      </div>

      <AgendaWorkspaceNav
        active={workspaceTab}
        onChange={setWorkspaceTab}
        counts={{
          dashboard: total,
          calendar: total,
          availability: freeSlotCount,
          operations: waitlistActiveCount + blocksActiveCount,
          settings: doctorTzQuery.data ? 1 : 0,
        }}
      />

      <div
        id={`agenda-panel-${workspaceTab}`}
        role="tabpanel"
        aria-labelledby={`agenda-tab-${workspaceTab}`}
        className="space-y-4"
      >
        {workspaceTab === "dashboard" ? (
          <AgendaDashboardPanel
            metrics={dashboardMetrics}
            isLoading={
              isLoading &&
              availability.isLoading &&
              !appointments.length &&
              !availability.data
            }
            clinicTimezone={timeZone}
            clinicName={clinicName}
          />
        ) : null}

        {workspaceTab === "calendar" ? (
          <>
            {isLoading ? (
              <AgendaSkeleton rows={6} label="Cargando calendario" />
            ) : isError ? (
              <div
                className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100"
                role="alert"
              >
                No se pudieron cargar las citas. Use «Actualizar todo» o
                verifique la sesión.
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center shadow-soft dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Sin citas en este periodo
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Cree una cita o cambie el rango / profesional.
                </p>
                <Button
                  type="button"
                  onClick={() => openCreate()}
                  className="mt-4 rounded-lg border-0 bg-primary px-4 py-2 text-sm shadow-none hover:bg-primaryMid hover:scale-100"
                >
                  <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                  Nueva cita
                </Button>
              </div>
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
          </>
        ) : null}

        {workspaceTab === "availability" ? (
          <div className="space-y-3">
            <AgendaCollapsible
              bare
              title="Resumen de disponibilidad"
              subtitle="Fase 1 · SSOT availability"
              defaultOpen
            >
              <AgendaAvailabilityPanel
                summary={availability.data?.summary}
                isLoading={availability.isLoading}
                isError={availability.isError}
                clinicTimezone={timeZone}
                requiresDoctorId={requiresDoctorId}
              />
            </AgendaCollapsible>
            <AgendaCollapsible
              bare
              title="Reglas"
              subtitle="Fase 2 · CRUD reglas"
              defaultOpen
              badge={
                <AgendaStatusBadge
                  label="reglas"
                  value={availability.data?.rules?.length ?? 0}
                  tone="neutral"
                />
              }
            >
              <AgendaAvailabilityRulesPanel
                rules={availability.data?.rules}
                isLoading={availability.isLoading}
                isError={availability.isError}
                canManage={!requiresDoctorId}
              />
            </AgendaCollapsible>
            <AgendaCollapsible
              bare
              title="Slots"
              subtitle="Fase 3 · libres y ocupados"
              defaultOpen
              badge={
                <AgendaStatusBadge
                  label="libres"
                  value={requiresDoctorId ? "—" : freeSlotCount}
                  tone="success"
                />
              }
            >
              <AgendaSlotsPanel
                freeSlots={availability.data?.slots}
                appointments={appointments}
                clinicTimezone={timeZone}
                clinicId={user?.clinicId}
                doctorId={
                  isAdmin
                    ? doctorFilter || undefined
                    : availability.data?.resolvedDoctorId
                }
                isLoading={availability.isLoading}
                isError={availability.isError}
                canQuery={!requiresDoctorId}
                slotRangeLabel={slotRangeLabel}
                onSelectFreeSlot={(startsAt) => openCreate(startsAt)}
                onSelectOccupied={openOccupied}
              />
            </AgendaCollapsible>
          </div>
        ) : null}

        {workspaceTab === "operations" ? (
          <div className="space-y-3">
            <AgendaCollapsible
              bare
              title="Bloques"
              subtitle="Fase 4 · bloqueos de agenda"
              defaultOpen
              badge={
                <AgendaStatusBadge
                  label="activos"
                  value={blocksActiveCount}
                  tone="warning"
                />
              }
            >
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
            </AgendaCollapsible>
            <AgendaCollapsible
              bare
              title="Lista de espera"
              subtitle="Fase 5 · prioridad y huecos"
              defaultOpen
              badge={
                <AgendaStatusBadge
                  label="activos"
                  value={waitlistActiveCount}
                  tone="warning"
                />
              }
            >
              <AgendaWaitlistPanel
                entries={waitlistQuery.data}
                isLoading={waitlistQuery.isLoading}
                isError={waitlistQuery.isError}
                clinicTimezone={timeZone}
                clinicId={user?.clinicId}
                doctorOptions={doctorOptions}
                defaultDoctorId={doctorFilter}
                canManage={user?.role === "doctor" || isAdmin}
              />
            </AgendaCollapsible>
            <AgendaCollapsible
              bare
              title="Recordatorios"
              subtitle="Fase 6 · políticas y programados"
              defaultOpen={false}
              badge={
                <AgendaStatusBadge
                  label="pendientes"
                  value={reminderPendingCount}
                  tone="info"
                />
              }
            >
              <AgendaRemindersPanel
                policies={reminderPoliciesQuery.data}
                reminders={remindersQuery.data}
                isLoading={
                  reminderPoliciesQuery.isLoading || remindersQuery.isLoading
                }
                isError={
                  reminderPoliciesQuery.isError || remindersQuery.isError
                }
                clinicTimezone={timeZone}
                clinicId={user?.clinicId}
                doctorOptions={doctorOptions}
                defaultDoctorId={doctorFilter}
                canManage={user?.role === "doctor" || isAdmin}
              />
            </AgendaCollapsible>
          </div>
        ) : null}

        {workspaceTab === "settings" ? (
          <AgendaTimezonePanel
            clinicTimezone={timeZone}
            clinicName={clinicName}
            doctorTimezone={doctorTzQuery.data}
            appointments={appointments}
            canEditClinic={isAdmin}
            canEditDoctor={user?.role === "doctor"}
            timezoneSource={timezoneSource}
          />
        ) : null}
      </div>

      <AppointmentFormModal
        open={modalOpen}
        appointment={selected}
        defaultStartsAt={createAt}
        clinicTimezone={timeZone}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
      />
    </div>
  );
}
