"use client";

import type { Appointment } from "@/lib/services/appointments";
import {
  dayHours,
  eventFallsOnDay,
  eventHeightPercent,
  eventTopPercent,
  formatInClinic,
} from "@/lib/agenda/calendar-utils";
import {
  calendarStatusClass,
  displayStatus,
  doctorLabel,
  patientLabel,
} from "@/lib/agenda/appointment-display";
import { cn } from "@/lib/utils";

type Props = {
  anchor: Date;
  appointments: Appointment[];
  timeZone: string;
  onSelectAppointment: (a: Appointment) => void;
};

export function AgendaDayView({
  anchor,
  appointments,
  timeZone,
  onSelectAppointment,
}: Props) {
  const hours = dayHours();
  const dayEvents = appointments.filter((a) =>
    eventFallsOnDay(a.startsAt ?? a.date, anchor, timeZone),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Citas del día ({dayEvents.length})
        </h3>
        <ul className="mt-3 space-y-2">
          {dayEvents.length === 0 && (
            <li className="text-sm text-slate-500">Sin citas programadas.</li>
          )}
          {dayEvents.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onSelectAppointment(a)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left hover:border-primary dark:border-slate-700 dark:hover:border-primary"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-100">
                  {patientLabel(a)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatInClinic(a.startsAt, timeZone, "HH:mm")} –{" "}
                  {formatInClinic(a.endsAt, timeZone, "HH:mm")}
                </div>
                <div className="text-xs text-slate-500">{doctorLabel(a)}</div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="relative min-h-[640px] rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
        {hours.map((hour) => (
          <div
            key={hour}
            className="flex border-b border-slate-100 dark:border-slate-800"
            style={{ minHeight: 48 }}
          >
            <div className="w-16 shrink-0 px-2 py-2 text-xs text-slate-500">
              {String(hour).padStart(2, "0")}:00
            </div>
            <div className="relative flex-1" />
          </div>
        ))}
        <div className="pointer-events-none absolute inset-0 left-16">
          {dayEvents.map((a) => {
            if (!a.startsAt) return null;
            const status = displayStatus(a);
            return (
              <button
                key={a.id}
                type="button"
                style={{
                  top: `${eventTopPercent(a.startsAt, timeZone)}%`,
                  height: `${Math.max(4, eventHeightPercent(a.startsAt, a.endsAt ?? a.startsAt))}%`,
                }}
                onClick={() => onSelectAppointment(a)}
                className={cn(
                  "pointer-events-auto absolute left-2 right-4 overflow-hidden rounded-xl border px-3 py-2 text-left text-sm shadow-md",
                  calendarStatusClass[status],
                )}
              >
                <div className="font-bold">{patientLabel(a)}</div>
                <div>
                  {formatInClinic(a.startsAt, timeZone, "HH:mm")} –{" "}
                  {formatInClinic(a.endsAt, timeZone, "HH:mm")}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
