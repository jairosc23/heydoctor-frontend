/**
 * EPIC-3 UC-01 — Resolve Agenda slice for a consultation (read-only).
 * Reuses GET /appointments (patient filter). No new endpoints.
 */

import { fetchAppointments } from "@/lib/services/appointments";
import type { PreVisitAgendaSlice } from "./pre-visit-context";

export type AppointmentWithConsultationLink = {
  id: string;
  reason?: string | null;
  startsAt?: string;
  status?: string;
  consultationId?: string | null;
};

export function pickAgendaForConsultation(
  appointments: AppointmentWithConsultationLink[],
  consultationId: string,
): PreVisitAgendaSlice {
  const match = appointments.find(
    (item) => item.consultationId === consultationId,
  );
  if (!match) {
    return {
      appointmentId: null,
      reason: null,
      startsAt: null,
      status: null,
    };
  }
  return {
    appointmentId: match.id,
    reason: match.reason?.trim() || null,
    startsAt: match.startsAt ?? null,
    status: match.status ?? null,
  };
}

export async function resolveAgendaContextForConsultation(input: {
  consultationId: string;
  patientId: string;
}): Promise<PreVisitAgendaSlice> {
  try {
    const list = await fetchAppointments({
      patientId: input.patientId,
      limit: 50,
    });
    return pickAgendaForConsultation(
      list.data as AppointmentWithConsultationLink[],
      input.consultationId,
    );
  } catch {
    return {
      appointmentId: null,
      reason: null,
      startsAt: null,
      status: null,
    };
  }
}
