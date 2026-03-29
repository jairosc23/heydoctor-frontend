import { apiGet, apiPatch, apiPost } from "../api-client";
import { getApiBase } from "../api-base";

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
  const base = getApiBase();
  const res = await fetch(`${base}/doctor-applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { message?: string }).message || "Error al enviar solicitud"
    );
  }
  return res.json() as Promise<DoctorApplication>;
}

export async function fetchDoctorApplications(
  status?: string
): Promise<DoctorApplication[]> {
  const q = status ? `?status=${status}` : "";
  return apiGet<DoctorApplication[]>(`/doctor-applications${q}`);
}

export async function reviewDoctorApplication(
  id: string,
  decision: "approved" | "rejected",
  rejectionReason?: string
): Promise<DoctorApplication> {
  return apiPatch<DoctorApplication>(`/doctor-applications/${id}/review`, {
    status: decision,
    rejectionReason,
  });
}
