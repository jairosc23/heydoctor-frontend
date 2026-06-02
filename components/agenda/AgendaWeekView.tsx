"use client";

import type { Appointment } from "@/lib/services/appointments";
import {
  dayHours,
  eventFallsOnDay,
  eventHeightPercent,
  eventTopPercent,
  format,
  formatInClinic,
  weekDays,
} from "@/lib/agenda/calendar-utils";
import {
  calendarStatusClass,
  displayStatus,
  patientLabel,
} from "@/lib/agenda/appointment-display";
import { cn } from "@/lib/utils";

type Props = {
  anchor: Date;
  appointments: Appointment[];
  timeZone: string;
  onSelectAppointment: (a: Appointment) => void;
};

export function AgendaWeekView({
  anchor,
  appointments,
  timeZone,
  onSelectAppointment,
}: Props) {
  const days = weekDays(anchor);
  const hours = dayHours();

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
      <div className="grid min-w-[800px] grid-cols-[64px_repeat(7,1fr)]">
        <div className="border-b border-r border-slate-200 dark:border-slate-700" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="border-b border-r border-slate-200 px-2 py-3 text-center dark:border-slate-700"
          >
            <div className="text-xs uppercase text-slate-500 dark:text-slate-400">
              {format(day, "EEE")}
            </div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {format(day, "d")}
            </div>
          </div>
        ))}
        {hours.map((hour) => (
          <HourRow
            key={hour}
            hour={hour}
            days={days}
            appointments={appointments}
            timeZone={timeZone}
            onSelectAppointment={onSelectAppointment}
          />
        ))}
      </div>
    </div>
  );
}

function HourRow({
  hour,
  days,
  appointments,
  timeZone,
  onSelectAppointment,
}: {
  hour: number;
  days: Date[];
  appointments: Appointment[];
  timeZone: string;
  onSelectAppointment: (a: Appointment) => void;
}) {
  return (
    <>
      <div className="border-b border-r border-slate-100 px-2 py-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {String(hour).padStart(2, "0")}:00
      </div>
      {days.map((day) => {
        const dayEvents = appointments.filter((a) => {
          if (!a.startsAt) return false;
          if (!eventFallsOnDay(a.startsAt, day, timeZone)) return false;
          const h = new Date(a.startsAt).getHours();
          return h === hour || (h < hour && new Date(a.endsAt ?? a.startsAt).getHours() > hour);
        });
        return (
          <div
            key={`${day.toISOString()}-${hour}`}
            className="relative min-h-[56px] border-b border-r border-slate-100 dark:border-slate-800"
          >
            {dayEvents.map((a) => {
              const status = displayStatus(a);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onSelectAppointment(a)}
                  style={{
                    top: `${eventTopPercent(a.startsAt!, timeZone)}%`,
                    height: `${Math.max(18, eventHeightPercent(a.startsAt!, a.endsAt ?? a.startsAt!))}%`,
                  }}
                  className={cn(
                    "absolute left-1 right-1 overflow-hidden rounded-md border px-1 py-0.5 text-left text-[10px] font-medium",
                    calendarStatusClass[status],
                  )}
                >
                  <div className="truncate">{patientLabel(a)}</div>
                  <div className="truncate opacity-80">
                    {formatInClinic(a.startsAt, timeZone, "HH:mm")}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
