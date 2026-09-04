import type { AppointmentFilters } from "@/lib/services/appointments";
import type { ConsultationFilters } from "@/lib/services/consultations";
import type { PatientFilters } from "@/lib/services/patients";

export const PATIENTS_LIST_ROOT = ["patients", "list"] as const;
export const CONSULTATIONS_LIST_ROOT = ["consultations", "list"] as const;
export const APPOINTMENTS_LIST_ROOT = ["appointments", "list"] as const;
export const MY_ORGANIZATIONS_ROOT = ["organizations", "mine"] as const;
export const ORGANIZATION_DASHBOARD_ROOT = ["organizations", "dashboard"] as const;
export const PORTAL_INDEX_ROOT = ["portal", "index"] as const;

function stableFilterKey(
  entries: [string, string | number | undefined | null][],
): string {
  const normalized = entries
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => [k, typeof v === "number" ? v : String(v).trim()] as const)
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(normalized);
}

export function patientsListQueryKey(filters?: PatientFilters) {
  return [
    ...PATIENTS_LIST_ROOT,
    stableFilterKey([
      ["search", filters?.search],
      ["limit", filters?.limit],
      ["page", filters?.page],
      ["offset", filters?.offset],
    ]),
  ] as const;
}

export function consultationsListQueryKey(filters?: ConsultationFilters) {
  return [
    ...CONSULTATIONS_LIST_ROOT,
    stableFilterKey([
      ["patientId", filters?.patientId],
      ["doctorId", filters?.doctorId],
      ["status", filters?.status],
      ["from", filters?.from],
      ["to", filters?.to],
      ["search", filters?.search],
      ["limit", filters?.limit],
      ["page", filters?.page],
      ["offset", filters?.offset],
    ]),
  ] as const;
}

export function myOrganizationsQueryKey() {
  return [...MY_ORGANIZATIONS_ROOT] as const;
}

export function organizationDashboardQueryKey(id: string) {
  return [...ORGANIZATION_DASHBOARD_ROOT, id] as const;
}

export function portalIndexQueryKey(section: string) {
  return [...PORTAL_INDEX_ROOT, section] as const;
}

export function appointmentsListQueryKey(filters?: AppointmentFilters) {
  return [
    ...APPOINTMENTS_LIST_ROOT,
    stableFilterKey([
      ["patientId", filters?.patientId],
      ["doctorId", filters?.doctorId],
      ["status", filters?.status],
      ["from", filters?.from],
      ["to", filters?.to],
      ["limit", filters?.limit],
      ["offset", filters?.offset],
    ]),
  ] as const;
}
