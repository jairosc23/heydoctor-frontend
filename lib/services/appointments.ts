import { heydoctorApi } from "../heydoctor-api";

const BASE = "/appointments";

export type AppointmentStatus =
  | "DRAFT"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "REFUND_PENDING"
  | "REFUNDED";

export interface Appointment {
  id: string;
  startsAt?: string;
  endsAt?: string;
  date?: string;
  clinicTimezone?: string;
  patientTimezone?: string;
  status?: AppointmentStatus;
  paymentStatus?: string;
  refundEligible?: boolean;
  invoiceReady?: boolean;
  reminderSummary?: Record<string, unknown>;
  patient?: { name?: string; firstname?: string; lastname?: string };
  doctor?: {
    name?: string;
    email?: string;
    user?: { name?: string; firstName?: string; lastName?: string };
  };
}

export interface AppointmentFilters {
  patientId?: string;
  doctorId?: string;
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface AppointmentListResponse {
  data: Appointment[];
  total: number;
}

export async function fetchAppointments(
  filters?: AppointmentFilters,
): Promise<AppointmentListResponse> {
  const params = new URLSearchParams();
  if (filters?.patientId) params.set("patientId", filters.patientId);
  if (filters?.doctorId) params.set("doctorId", filters.doctorId);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.limit != null) params.set("limit", String(filters.limit));
  if (filters?.offset != null) params.set("offset", String(filters.offset));
  const q = params.toString() ? `?${params}` : "";
  const result = await heydoctorApi.getOrFallback<
    Appointment[] | AppointmentListResponse
  >(`${BASE}${q}`, []);

  if (Array.isArray(result)) {
    return { data: result, total: result.length };
  }
  return {
    data: Array.isArray(result.data) ? result.data : [],
    total: Number.isFinite(result.total) ? result.total : result.data.length,
  };
}

export async function transitionAppointment(
  appointmentId: string,
  status: AppointmentStatus,
  expectedVersion?: number,
) {
  return heydoctorApi.post<Appointment>(`${BASE}/${appointmentId}/transition`, {
    status,
    expectedVersion,
  });
}
