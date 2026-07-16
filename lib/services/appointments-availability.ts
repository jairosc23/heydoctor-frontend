/**
 * Agenda Enterprise — availability client (SSOT: backend AppointmentsAvailabilityService).
 * Reuses existing `/appointments/availability/*` endpoints. No parallel APIs.
 */
import { heydoctorApi } from "../heydoctor-api";

const BASE = "/appointments";

/** 0 = Sunday … 6 = Saturday (matches BE DoctorAvailabilityRule). */
export type DoctorAvailabilityRule = {
  id: string;
  clinicId: string;
  doctorId: string;
  dayOfWeek: number;
  startMinutes: number;
  endMinutes: number;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  doctorId: string;
};

export type ListAvailabilitySlotsParams = {
  from: string;
  to: string;
  clinicTimezone: string;
  doctorId?: string;
  slotMinutes?: number;
};

/** Matches BE CreateAvailabilityRuleDto — SSOT create contract. */
export type CreateAvailabilityRulePayload = {
  dayOfWeek: number;
  startMinutes: number;
  endMinutes: number;
  effectiveFrom?: string;
  effectiveUntil?: string;
  isActive?: boolean;
  doctorId?: string;
};

/**
 * Update/delete of persisted rules are not exposed by current BE controller
 * (only GET list + POST create). Client keeps types ready for SSOT completion.
 */
export type UpdateAvailabilityRulePayload = Partial<CreateAvailabilityRulePayload>;

export async function fetchAvailabilityRules(
  doctorId?: string,
): Promise<DoctorAvailabilityRule[]> {
  const params = new URLSearchParams();
  if (doctorId) params.set("doctorId", doctorId);
  const q = params.toString() ? `?${params}` : "";
  const result = await heydoctorApi.getOrFallback<DoctorAvailabilityRule[]>(
    `${BASE}/availability/rules${q}`,
    [],
  );
  return Array.isArray(result) ? result : [];
}

export async function createAvailabilityRule(
  payload: CreateAvailabilityRulePayload,
): Promise<DoctorAvailabilityRule> {
  return heydoctorApi.post<DoctorAvailabilityRule>(
    `${BASE}/availability/rules`,
    payload,
  );
}

export async function updateAvailabilityRule(
  ruleId: string,
  payload: UpdateAvailabilityRulePayload,
): Promise<DoctorAvailabilityRule> {
  return heydoctorApi.patch<DoctorAvailabilityRule>(
    `${BASE}/availability/rules/${ruleId}`,
    payload,
  );
}

export async function deleteAvailabilityRule(ruleId: string): Promise<void> {
  await heydoctorApi.delete(`${BASE}/availability/rules/${ruleId}`);
}

export async function fetchAvailabilitySlots(
  params: ListAvailabilitySlotsParams,
): Promise<AvailabilitySlot[]> {
  const qs = new URLSearchParams();
  qs.set("from", params.from);
  qs.set("to", params.to);
  qs.set("clinicTimezone", params.clinicTimezone);
  if (params.doctorId) qs.set("doctorId", params.doctorId);
  if (params.slotMinutes != null) {
    qs.set("slotMinutes", String(params.slotMinutes));
  }
  const result = await heydoctorApi.getOrFallback<AvailabilitySlot[]>(
    `${BASE}/availability/slots?${qs}`,
    [],
  );
  return Array.isArray(result) ? result : [];
}
