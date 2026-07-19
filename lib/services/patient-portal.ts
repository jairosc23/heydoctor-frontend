/**
 * EPIC-2 Patient Portal API client (Staff auth channel, role=patient).
 * Telemedicine join still uses Guest channel via /teleconsulta/invitado (ADR-001).
 */

import { heydoctorApi } from "../heydoctor-api";

export type PatientPortalAppointment = {
  id: string;
  status: string;
  paymentStatus: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  reason: string | null;
  doctorId: string;
  doctorName: string | null;
  clinicId: string;
  telemedicineAccessToken: string | null;
  telemedicineReady: boolean;
  consultationId: string | null;
  canCancel: boolean;
  canReschedule: boolean;
  version: number;
};

export type PatientPortalDashboard = {
  patient: Record<string, unknown>;
  upcoming: PatientPortalAppointment[];
  history: PatientPortalAppointment[];
  paymentsSummary: {
    pending: number;
    paid: number;
    other: number;
  };
};

export type PatientTelemedicinePrep = {
  consultationId: string;
  roomId: string;
  joinUrl: string;
  signalingToken: string;
  consentRequired: boolean;
  consentVersion: string;
  appointmentStatus: string;
  paymentStatus: string;
};

export async function registerPatient(input: {
  email: string;
  password: string;
  clinicId: string;
  name: string;
  bookingToken?: string;
}) {
  return heydoctorApi.post<{
    user: { id: string; email: string; role: string; clinicId: string };
    access_token: string;
    csrfToken?: string;
  }>("/auth/patient/register", input, { requireAuth: false });
}

export async function fetchPortalDashboard() {
  return heydoctorApi.get<PatientPortalDashboard>("/portal/dashboard");
}

export async function fetchPortalAppointments() {
  return heydoctorApi.get<PatientPortalAppointment[]>("/portal/appointments");
}

export async function fetchPortalAppointment(id: string) {
  return heydoctorApi.get<PatientPortalAppointment>(
    `/portal/appointments/${id}`,
  );
}

export async function cancelPortalAppointment(id: string, reason?: string) {
  return heydoctorApi.post<PatientPortalAppointment>(
    `/portal/appointments/${id}/cancel`,
    { reason },
  );
}

export async function reschedulePortalAppointment(
  id: string,
  startsAt: string,
  durationMinutes?: number,
) {
  return heydoctorApi.post<PatientPortalAppointment>(
    `/portal/appointments/${id}/reschedule`,
    { startsAt, durationMinutes },
  );
}

export async function fetchPortalTelemedicine(id: string) {
  return heydoctorApi.get<PatientTelemedicinePrep>(
    `/portal/appointments/${id}/telemedicine`,
  );
}

export async function claimPortalBooking(token: string) {
  return heydoctorApi.post<PatientPortalAppointment>(
    `/portal/bookings/${token}/claim`,
    {},
  );
}
