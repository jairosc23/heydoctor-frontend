"use client";

import type { Appointment } from "@/lib/services/appointments";
import {
  eventFallsOnDay,
  format,
  isSameMonth,
  monthGridDays,
} from "@/lib/agenda/calendar-utils";
import { AppointmentEventCard } from "./AppointmentEventCard";

type Props = {
  anchor: Date;
  appointments: Appointment[];
  timeZone: string;
  onSelectAppointment: (a: Appointment) => void;
  onSelectDay: (day: Date) => void;
};

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function AgendaMonthView({
  anchor,
  appointments,
  timeZone,
  onSelectAppointment,
  onSelectDay,
}: Props) {
  const days = monthGridDays(anchor);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(110px,1fr)]">
        {days.map((day) => {
          const inMonth = isSameMonth(day, anchor);
          const dayEvents = appointments.filter((a) =>
            eventFallsOnDay(a.startsAt ?? a.date, day, timeZone),
          );
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cnCell(inMonth)}
            >
              <span
                className={cnDayNumber(inMonth, day)}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {dayEvents.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAppointment(a);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    role="presentation"
                  >
                    <AppointmentEventCard
                      appointment={a}
                      timeZone={timeZone}
                      compact
                      onClick={() => onSelectAppointment(a)}
                    />
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    +{dayEvents.length - 3} más
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function cnCell(inMonth: boolean) {
  return [
    "min-h-[110px] border-b border-r border-slate-100 p-1 text-left transition hover:bg-primaryLight/40 dark:border-slate-800 dark:hover:bg-slate-800",
    inMonth ? "" : "bg-slate-50/80 dark:bg-slate-950/40",
  ].join(" ");
}

function cnDayNumber(inMonth: boolean, day: Date) {
  const today = new Date();
  const isToday =
    day.getDate() === today.getDate() &&
    day.getMonth() === today.getMonth() &&
    day.getFullYear() === today.getFullYear();
  return [
    "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
    inMonth ? "text-slate-800 dark:text-slate-100" : "text-slate-400",
    isToday ? "bg-primary text-white" : "",
  ].join(" ");
}
