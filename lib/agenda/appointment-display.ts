import type {
  Appointment,
  CalendarAppointmentStatus,
} from "@/lib/services/appointments";

export function patientLabel(appointment: Appointment): string {
  return (
    appointment.patient?.name ||
    [appointment.patient?.firstname, appointment.patient?.lastname]
      .filter(Boolean)
      .join(" ") ||
    "Paciente"
  );
}

export function doctorLabel(appointment: Appointment): string {
  return (
    appointment.doctor?.name ||
    appointment.doctor?.email ||
    "Médico"
  );
}

export const calendarStatusLabel: Record<CalendarAppointmentStatus, string> = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistió",
};

export const calendarStatusClass: Record<CalendarAppointmentStatus, string> = {
  SCHEDULED:
    "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-100 dark:border-amber-800",
  CONFIRMED:
    "bg-cyan-100 text-cyan-900 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-100 dark:border-cyan-800",
  IN_PROGRESS:
    "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:text-blue-100 dark:border-blue-800",
  COMPLETED:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600",
  CANCELLED:
    "bg-red-100 text-red-900 border-red-200 dark:bg-red-950/60 dark:text-red-100 dark:border-red-800",
  NO_SHOW:
    "bg-rose-200 text-rose-950 border-rose-300 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-800",
};

export function displayStatus(
  appointment: Appointment,
): CalendarAppointmentStatus {
  if (appointment.calendarStatus) return appointment.calendarStatus;
  switch (appointment.status) {
    case "CONFIRMED":
      return "CONFIRMED";
    case "CHECKED_IN":
    case "IN_CONSULTATION":
      return "IN_PROGRESS";
    case "COMPLETED":
    case "REFUND_PENDING":
    case "REFUNDED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    case "NO_SHOW":
      return "NO_SHOW";
    default:
      return "SCHEDULED";
  }
}
