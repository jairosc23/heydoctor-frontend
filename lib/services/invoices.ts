import { heydoctorApi } from "../heydoctor-api";
import { downloadClinicalPdf } from "../download-clinical-pdf";

const BASE = "/invoices";

export type ClinicalInvoiceStatus = "pending" | "paid" | "cancelled";

export interface ClinicalInvoice {
  id: string;
  consultationId?: string | null;
  patientId?: string;
  doctorId?: string;
  amountClp: number;
  documentNumber: string;
  status: ClinicalInvoiceStatus;
  issuedAt?: string;
  paidAt?: string | null;
  paykuPaymentId?: string | null;
}

export interface InvoiceDashboard {
  totalRevenueClp: number;
  pendingCount: number;
  pendingAmountClp: number;
  paidCount: number;
  invoices: ClinicalInvoice[];
}

export async function fetchInvoiceDashboard(): Promise<InvoiceDashboard> {
  return heydoctorApi.get<InvoiceDashboard>(`${BASE}/dashboard`);
}

export async function createInvoiceForConsultation(
  consultationId: string,
  amountClp: number,
): Promise<ClinicalInvoice> {
  return heydoctorApi.post<ClinicalInvoice>(
    `${BASE}/consultation/${consultationId}`,
    { amountClp },
  );
}

export async function downloadInvoicePdf(id: string): Promise<void> {
  await downloadClinicalPdf(`${BASE}/${id}/pdf`, `factura-${id.slice(0, 8)}.pdf`);
}
