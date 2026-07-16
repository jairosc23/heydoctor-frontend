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

export type CalendarAppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  startsAt?: string;
  endsAt?: string;
  date?: string;
  durationMinutes?: number;
  clinicTimezone?: string;
  patientTimezone?: string;
  status?: AppointmentStatus;
  calendarStatus?: CalendarAppointmentStatus;
  paymentStatus?: string;
  refundEligible?: boolean;
  invoiceReady?: boolean;
  version?: number;
  reason?: string | null;
  patientId?: string;
  doctorId?: string;
  reminderSummary?: Record<string, unknown>;
  patient?: {
    id?: string;
    name?: string;
    firstname?: string;
    lastname?: string;
  };
  doctor?: {
    id?: string;
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

export interface CreateAppointmentPayload {
  patientId: string;
  startsAt: string;
  durationMinutes?: number;
  clinicTimezone: string;
  patientTimezone?: string;
  reason?: string;
  doctorId?: string;
  status?: AppointmentStatus;
}

export interface UpdateAppointmentPayload {
  startsAt?: string;
  durationMinutes?: number;
  clinicTimezone?: string;
  patientTimezone?: string;
  reason?: string;
  calendarStatus?: CalendarAppointmentStatus;
  cancellationReason?: string;
  expectedVersion?: number;
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

export async function fetchAppointment(id: string): Promise<Appointment> {
  return heydoctorApi.get<Appointment>(`${BASE}/${id}`);
}

export async function createAppointment(
  payload: CreateAppointmentPayload,
): Promise<Appointment> {
  return heydoctorApi.post<Appointment>(BASE, payload);
}

export async function updateAppointment(
  id: string,
  payload: UpdateAppointmentPayload,
): Promise<Appointment> {
  return heydoctorApi.patch<Appointment>(`${BASE}/${id}`, payload);
}

export async function deleteAppointment(
  id: string,
  reason?: string,
): Promise<Appointment> {
  const q = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return heydoctorApi.delete<Appointment>(`${BASE}/${id}${q}`);
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

/** Agenda Enterprise Phase 5 — Waitlist SSOT */
export type WaitlistEntryStatus =
  | "active"
  | "promoted"
  | "expired"
  | "cancelled";

export interface WaitlistEntry {
  id: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  preferredFrom: string;
  preferredTo: string;
  clinicTimezone: string;
  priority: number;
  reason?: string | null;
  status: WaitlistEntryStatus;
  promotedAppointmentId?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  matchingSlotAvailable?: boolean;
  nextMatchingSlotStartsAt?: string | null;
  patient?: {
    id?: string;
    name?: string;
    firstname?: string;
    lastname?: string;
    firstName?: string;
    lastName?: string;
  };
  doctor?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

export interface WaitlistFilters {
  from?: string;
  to?: string;
  doctorId?: string;
  status?: WaitlistEntryStatus;
}

export interface CreateWaitlistEntryPayload {
  patientId: string;
  doctorId?: string;
  preferredFrom: string;
  preferredTo: string;
  clinicTimezone: string;
  expiresAt?: string;
  priority?: number;
  reason?: string;
}

export interface UpdateWaitlistEntryPayload {
  preferredFrom?: string;
  preferredTo?: string;
  expiresAt?: string | null;
  reason?: string | null;
  priority?: number;
  status?: "active" | "cancelled";
}

export async function fetchWaitlistEntries(
  filters?: WaitlistFilters,
): Promise<WaitlistEntry[]> {
  const params = new URLSearchParams();
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.doctorId) params.set("doctorId", filters.doctorId);
  if (filters?.status) params.set("status", filters.status);
  const q = params.toString() ? `?${params}` : "";
  const result = await heydoctorApi.getOrFallback<WaitlistEntry[]>(
    `${BASE}/waitlist${q}`,
    [],
  );
  return Array.isArray(result) ? result : [];
}

export async function createWaitlistEntry(
  payload: CreateWaitlistEntryPayload,
): Promise<WaitlistEntry> {
  return heydoctorApi.post<WaitlistEntry>(`${BASE}/waitlist`, payload);
}

export async function updateWaitlistEntry(
  id: string,
  payload: UpdateWaitlistEntryPayload,
): Promise<WaitlistEntry> {
  return heydoctorApi.patch<WaitlistEntry>(`${BASE}/waitlist/${id}`, payload);
}

export async function deleteWaitlistEntry(id: string): Promise<void> {
  await heydoctorApi.delete(`${BASE}/waitlist/${id}`);
}

/** Agenda Enterprise Phase 6 — Reminders SSOT (admin/visualize; no real send) */
export type ReminderType =
  | "confirmation"
  | "upcoming"
  | "no_show_risk"
  | "follow_up";

export type ReminderChannel = "email" | "sms" | "push" | "whatsapp";

export type ReminderStatus = "scheduled" | "sent" | "failed" | "skipped";

export type ReminderAnchor = "starts_at" | "ends_at";

export interface ReminderPolicy {
  id: string;
  clinicId: string;
  doctorId?: string | null;
  type: ReminderType;
  channel: ReminderChannel;
  offsetMinutes: number;
  anchor: ReminderAnchor;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  clinicId: string;
  type: ReminderType;
  channel: ReminderChannel;
  status: ReminderStatus;
  offsetMinutes: number;
  scheduledFor: string;
  sentAt?: string | null;
  lastError?: string | null;
  retryCount?: number;
  createdAt?: string;
  appointment?: Appointment;
}

export interface ReminderFilters {
  from?: string;
  to?: string;
  doctorId?: string;
  appointmentId?: string;
  status?: ReminderStatus;
  type?: ReminderType;
  channel?: ReminderChannel;
}

export interface CreateReminderPolicyPayload {
  doctorId?: string;
  type: ReminderType;
  channel: ReminderChannel;
  offsetMinutes: number;
  anchor?: ReminderAnchor;
  isActive?: boolean;
}

export interface UpdateReminderPolicyPayload {
  doctorId?: string | null;
  type?: ReminderType;
  channel?: ReminderChannel;
  offsetMinutes?: number;
  anchor?: ReminderAnchor;
  isActive?: boolean;
}

export interface CreateReminderPayload {
  appointmentId: string;
  type: ReminderType;
  channel: ReminderChannel;
  scheduledFor?: string;
  offsetMinutes?: number;
}

export interface UpdateReminderPayload {
  scheduledFor?: string;
  channel?: ReminderChannel;
  status?: "scheduled" | "skipped";
}

export async function fetchReminderPolicies(doctorId?: string): Promise<ReminderPolicy[]> {
  const params = new URLSearchParams();
  if (doctorId) params.set("doctorId", doctorId);
  const q = params.toString() ? `?${params}` : "";
  const result = await heydoctorApi.getOrFallback<ReminderPolicy[]>(
    `${BASE}/reminders/policies${q}`,
    [],
  );
  return Array.isArray(result) ? result : [];
}

export async function createReminderPolicy(
  payload: CreateReminderPolicyPayload,
): Promise<ReminderPolicy> {
  return heydoctorApi.post<ReminderPolicy>(`${BASE}/reminders/policies`, payload);
}

export async function updateReminderPolicy(
  id: string,
  payload: UpdateReminderPolicyPayload,
): Promise<ReminderPolicy> {
  return heydoctorApi.patch<ReminderPolicy>(
    `${BASE}/reminders/policies/${id}`,
    payload,
  );
}

export async function deleteReminderPolicy(id: string): Promise<void> {
  await heydoctorApi.delete(`${BASE}/reminders/policies/${id}`);
}

export async function fetchReminders(
  filters?: ReminderFilters,
): Promise<AppointmentReminder[]> {
  const params = new URLSearchParams();
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.doctorId) params.set("doctorId", filters.doctorId);
  if (filters?.appointmentId) params.set("appointmentId", filters.appointmentId);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.type) params.set("type", filters.type);
  if (filters?.channel) params.set("channel", filters.channel);
  const q = params.toString() ? `?${params}` : "";
  const result = await heydoctorApi.getOrFallback<AppointmentReminder[]>(
    `${BASE}/reminders${q}`,
    [],
  );
  return Array.isArray(result) ? result : [];
}

export async function createReminder(
  payload: CreateReminderPayload,
): Promise<AppointmentReminder> {
  return heydoctorApi.post<AppointmentReminder>(`${BASE}/reminders`, payload);
}

export async function updateReminder(
  id: string,
  payload: UpdateReminderPayload,
): Promise<AppointmentReminder> {
  return heydoctorApi.patch<AppointmentReminder>(`${BASE}/reminders/${id}`, payload);
}

export async function deleteReminder(id: string): Promise<void> {
  await heydoctorApi.delete(`${BASE}/reminders/${id}`);
}
