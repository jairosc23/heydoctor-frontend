"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import {
  calendarStatusLabel,
  patientLabel,
} from "@/lib/agenda/appointment-display";
import { displayStatus } from "@/lib/agenda/appointment-display";
import { resolveClinicTimezone } from "@/lib/agenda/calendar-utils";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { APPOINTMENTS_LIST_ROOT } from "@/lib/queries/query-keys";
import { usePatientsListQuery } from "@/lib/hooks/use-panel-list-queries";
import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
  type Appointment,
  type CalendarAppointmentStatus,
} from "@/lib/services/appointments";

type Props = {
  open: boolean;
  appointment: Appointment | null;
  defaultStartsAt?: Date;
  onClose: () => void;
};

const STATUS_OPTIONS: CalendarAppointmentStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export function AppointmentFormModal({
  open,
  appointment,
  defaultStartsAt,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const tz = resolveClinicTimezone();
  const { data: patientsData } = usePatientsListQuery({ limit: 100 });
  const patients = patientsData?.data ?? [];

  const [patientId, setPatientId] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [reason, setReason] = useState("");
  const [calendarStatus, setCalendarStatus] =
    useState<CalendarAppointmentStatus>("SCHEDULED");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (appointment) {
      setPatientId(appointment.patient?.id ?? appointment.patientId ?? "");
      const start = appointment.startsAt ?? appointment.date;
      if (start) {
        const d = new Date(start);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
          .toISOString()
          .slice(0, 16);
        setStartsAtLocal(local);
      }
      setDurationMinutes(appointment.durationMinutes ?? 30);
      setReason(appointment.reason ?? "");
      setCalendarStatus(displayStatus(appointment));
    } else if (defaultStartsAt) {
      const d = defaultStartsAt;
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16);
      setStartsAtLocal(local);
      setDurationMinutes(30);
      setPatientId("");
      setReason("");
      setCalendarStatus("SCHEDULED");
    }
  }, [open, appointment, defaultStartsAt]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: APPOINTMENTS_LIST_ROOT });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const startsAt = new Date(startsAtLocal).toISOString();
      if (appointment?.id) {
        return updateAppointment(appointment.id, {
          startsAt,
          durationMinutes,
          reason: reason || undefined,
          clinicTimezone: tz,
          calendarStatus,
          expectedVersion: appointment.version,
        });
      }
      if (!patientId) throw new Error("Seleccione un paciente");
      return createAppointment({
        patientId,
        startsAt,
        durationMinutes,
        clinicTimezone: tz,
        patientTimezone: tz,
        reason: reason || undefined,
        status: calendarStatus === "CONFIRMED" ? "CONFIRMED" : "PENDING_CONFIRMATION",
      });
    },
    onSuccess: async () => {
      await invalidate();
      onClose();
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!appointment?.id) return;
      return deleteAppointment(appointment.id, "cancelled_from_agenda");
    },
    onSuccess: async () => {
      await invalidate();
      onClose();
    },
    onError: (e) => setError(getApiErrorMessage(e)),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-premium dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {appointment ? "Editar cita" : "Nueva cita"}
        </h2>
        {appointment && (
          <p className="mt-1 text-sm text-slate-500">
            {patientLabel(appointment)}
          </p>
        )}

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          {!appointment && (
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Paciente
              <select
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              >
                <option value="">Seleccionar…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ||
                      [p.firstname, p.lastname].filter(Boolean).join(" ")}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Inicio ({tz})
            <input
              type="datetime-local"
              required
              value={startsAtLocal}
              onChange={(e) => setStartsAtLocal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Duración (min)
            <input
              type="number"
              min={10}
              max={240}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Motivo
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>

          {appointment && (
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Estado
              <select
                value={calendarStatus}
                onChange={(e) =>
                  setCalendarStatus(e.target.value as CalendarAppointmentStatus)
                }
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {calendarStatusLabel[s]}
                  </option>
                ))}
              </select>
            </label>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Guardando…" : "Guardar"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
            {appointment && (
              <Button
                type="button"
                variant="secondary"
                className="!text-red-700"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                Cancelar cita
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
