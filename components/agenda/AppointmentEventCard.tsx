"use client";

import type { Appointment } from "@/lib/services/appointments";
import {
  calendarStatusClass,
  calendarStatusLabel,
  displayStatus,
  patientLabel,
} from "@/lib/agenda/appointment-display";
import { formatInClinic } from "@/lib/agenda/calendar-utils";
import { cn } from "@/lib/utils";

type Props = {
  appointment: Appointment;
  timeZone: string;
  compact?: boolean;
  onClick?: () => void;
};

export function AppointmentEventCard({
  appointment,
  timeZone,
  compact,
  onClick,
}: Props) {
  const status = displayStatus(appointment);
  const start = formatInClinic(
    appointment.startsAt ?? appointment.date,
    timeZone,
    compact ? "HH:mm" : "HH:mm",
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border px-2 py-1 text-left text-xs shadow-sm transition hover:brightness-95",
        calendarStatusClass[status],
      )}
    >
      <div className="font-semibold truncate">{patientLabel(appointment)}</div>
      {!compact && (
        <div className="opacity-80 truncate">{start}</div>
      )}
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide opacity-90">
        {calendarStatusLabel[status]}
      </div>
    </button>
  );
}
