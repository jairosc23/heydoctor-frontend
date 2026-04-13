import { heydoctorApi } from "../heydoctor-api";

export interface DoctorApplicationDto {
  name: string;
  email: string;
  specialty: string;
  country: string;
  licenseUrl?: string;
}

export interface DoctorApplication {
  id: string;
  name: string;
  email: string;
  specialty: string;
  country: string;
  licenseUrl: string | null;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export async function submitDoctorApplication(
  dto: DoctorApplicationDto
): Promise<DoctorApplication> {
  return heydoctorApi.post<DoctorApplication>("/doctor-applications", dto, {
    requireAuth: false,
  });
}

export async function fetchDoctorApplications(
  status?: string
): Promise<DoctorApplication[]> {
  const q = status ? `?status=${status}` : "";
  return heydoctorApi.get<DoctorApplication[]>(`/doctor-applications${q}`);
}

export async function reviewDoctorApplication(
  id: string,
  decision: "approved" | "rejected",
  rejectionReason?: string
): Promise<DoctorApplication> {
  return heydoctorApi.patch<DoctorApplication>(`/doctor-applications/${id}/review`, {
    status: decision,
    rejectionReason,
  });
}
