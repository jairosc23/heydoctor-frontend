import { heydoctorApi } from "../heydoctor-api";

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended";
  homeClinicId: string;
  clinicCount: number;
  memberCount: number;
  role: "owner" | "admin" | "manager" | "member";
};

export type OrganizationClinicView = {
  clinicId: string;
  name: string;
  timezone: string;
  status: "active" | "invited";
  groupId: string | null;
  groupName: string | null;
  attachedAt: string;
};

export type OrganizationGroupView = {
  id: string;
  name: string;
  clinicIds: string[];
};

export type OrganizationMemberView = {
  id: string;
  userId: string;
  name: string;
  email: string;
  homeClinicId: string;
  role: "owner" | "admin" | "manager" | "member";
  clinicIds: string[];
  isActive: boolean;
};

export type OrganizationDashboard = {
  organization: OrganizationSummary;
  settings: {
    locale: string;
    timezone: string;
    allowSharedStaff: boolean;
    requireExplicitClinicScope: boolean;
  };
  permissions: {
    organizationId: string;
    role: OrganizationSummary["role"];
    homeClinicId: string;
    accessibleClinicIds: string[];
    canManage: boolean;
    allowSharedStaff: boolean;
  };
  directory: OrganizationClinicView[];
  groups: OrganizationGroupView[];
  members: OrganizationMemberView[];
  metrics: {
    clinics: number;
    consultationsCreated: number;
    consultationsCompleted: number;
    consultationsPaid: number;
    recognizedRevenue: { net: number };
    ledgerBalanced: boolean;
  };
  patients: { clinicId: string; count: number }[];
  platform: { ok: boolean; status: string; checkedAt: string };
};

export function organizationsPath(): string {
  return "/organizations";
}

export function organizationPath(id: string): string {
  return `/organizations/${id}`;
}

export function organizationDashboardPath(id: string): string {
  return `/organizations/${id}/dashboard`;
}

export function organizationPagePath(id?: string): string {
  return id ? `/organizacion/${id}` : "/organizacion";
}

export async function fetchMyOrganizations() {
  return heydoctorApi.get<OrganizationSummary[]>(organizationsPath());
}

export async function createOrganization(body: { name: string; timezone?: string }) {
  return heydoctorApi.post<OrganizationSummary>(organizationsPath(), body);
}

export async function fetchOrganizationDashboard(id: string) {
  return heydoctorApi.get<OrganizationDashboard>(organizationDashboardPath(id));
}

export async function inviteOrganizationClinic(id: string, clinicId: string) {
  return heydoctorApi.post<OrganizationClinicView>(
    `/organizations/${id}/clinics/invite`,
    { clinicId },
  );
}

export async function acceptOrganizationClinic(id: string) {
  return heydoctorApi.post<OrganizationClinicView[]>(
    `/organizations/${id}/clinics/accept`,
    {},
  );
}

export async function createOrganizationGroup(
  id: string,
  body: { name: string; clinicIds?: string[] },
) {
  return heydoctorApi.post<OrganizationGroupView>(
    `/organizations/${id}/groups`,
    body,
  );
}

export async function upsertOrganizationMember(
  id: string,
  body: { userId: string; role: OrganizationMemberView["role"]; clinicIds?: string[] },
) {
  return heydoctorApi.post<OrganizationMemberView[]>(
    `/organizations/${id}/members`,
    body,
  );
}

export async function updateOrganizationSettings(
  id: string,
  body: {
    locale?: string;
    timezone?: string;
    allowSharedStaff?: boolean;
    requireExplicitClinicScope?: boolean;
  },
) {
  return heydoctorApi.patch<OrganizationDashboard["settings"]>(
    `/organizations/${id}/settings`,
    body,
  );
}
