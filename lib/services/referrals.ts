import { heydoctorApi } from "../heydoctor-api";
import { downloadClinicalPdf } from "../download-clinical-pdf";

const BASE = "/referrals";

export type ReferralStatus = "PENDING" | "ACCEPTED" | "COMPLETED";

export interface ReferralAttachment {
  name: string;
  mimeType?: string;
  url?: string;
}

export interface ReferralRecord {
  id: string;
  patientId: string;
  consultationId?: string | null;
  receivingDoctorName: string;
  receivingDoctorEmail?: string | null;
  specialty: string;
  reason: string;
  attachments?: ReferralAttachment[];
  status: ReferralStatus;
  createdAt?: string;
}

export interface CreateReferralDto {
  patientId: string;
  consultationId?: string;
  receivingDoctorName: string;
  receivingDoctorEmail?: string;
  specialty: string;
  reason: string;
  attachments?: ReferralAttachment[];
  habDecisionId?: string;
}

export async function fetchReferralsByPatient(
  patientId: string,
): Promise<ReferralRecord[]> {
  const res = await heydoctorApi.get<{ data: ReferralRecord[] }>(
    `${BASE}/patient/${patientId}`,
  );
  return res.data ?? [];
}

export async function createReferral(
  dto: CreateReferralDto,
): Promise<ReferralRecord> {
  const res = await heydoctorApi.post<{ data: ReferralRecord }>(BASE, dto);
  return res.data;
}

export async function updateReferralStatus(
  id: string,
  status: ReferralStatus,
  habDecisionId: string,
): Promise<ReferralRecord> {
  const res = await heydoctorApi.patch<{ data: ReferralRecord }>(
    `${BASE}/${id}/status`,
    { status, habDecisionId },
  );
  return res.data;
}

export async function downloadReferralPdf(id: string): Promise<void> {
  await downloadClinicalPdf(
    `${BASE}/${id}/pdf`,
    `interconsulta-${id.slice(0, 8)}.pdf`,
  );
}
