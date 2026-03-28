import { apiGetOrFallback } from "../api-client";

const BASE = "/appointments";
const EMPTY = { data: [] as unknown[], total: 0 };

export interface AppointmentFilters {
  patientId?: string;
  doctorId?: string;
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export async function fetchAppointments(filters?: AppointmentFilters) {
  const params = new URLSearchParams();
  if (filters?.patientId) params.set("patientId", filters.patientId);
  if (filters?.doctorId) params.set("doctorId", filters.doctorId);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.limit != null) params.set("limit", String(filters.limit));
  if (filters?.offset != null) params.set("offset", String(filters.offset));
  const q = params.toString() ? `?${params}` : "";
  return apiGetOrFallback<{ data: unknown[]; total: number }>(`${BASE}${q}`, EMPTY);
}
