import { DEFAULT_CONSULTATION_PRICE_CLP } from "../consultation-pricing";
import { heydoctorApi } from "../heydoctor-api";
import { fetchConsultation } from "../services/consultations";
import {
  createInvoiceForConsultation,
  downloadInvoicePdf,
  fetchInvoiceDashboard,
  type ClinicalInvoice,
} from "../services/invoices";
import {
  createPaymentSession,
  fetchConsultationPaymentStatus,
  type ConsultationPaymentStatus,
  type PaymentSession,
} from "../services/payments";
import type { EncounterId } from "./types";

export async function fetchEncounter(encounterId: EncounterId) {
  return fetchConsultation(encounterId);
}

export async function fetchEncounterPaymentStatus(
  encounterId: EncounterId,
): Promise<ConsultationPaymentStatus> {
  return fetchConsultationPaymentStatus(encounterId);
}

export async function createEncounterPaymentSession(
  encounterId: EncounterId,
): Promise<PaymentSession> {
  return createPaymentSession(encounterId);
}

export async function findInvoiceForEncounter(
  encounterId: EncounterId,
): Promise<ClinicalInvoice | null> {
  const dashboard = await fetchInvoiceDashboard();
  return (
    (dashboard.invoices ?? []).find(
      (invoice) => invoice.consultationId === encounterId,
    ) ?? null
  );
}

export async function fetchSettlementInvoiceAmount(): Promise<number> {
  try {
    const data = await heydoctorApi.get<{
      amountClp?: unknown;
      amount?: unknown;
    }>("/consultations/consultation-price", { requireAuth: false });
    const amount = Number(data.amountClp ?? data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return DEFAULT_CONSULTATION_PRICE_CLP;
    }
    return Math.round(amount);
  } catch {
    return DEFAULT_CONSULTATION_PRICE_CLP;
  }
}

export async function createEncounterInvoice(
  encounterId: EncounterId,
  amountClp: number,
): Promise<ClinicalInvoice> {
  return createInvoiceForConsultation(encounterId, amountClp);
}

export async function downloadEncounterInvoice(invoiceId: string): Promise<void> {
  await downloadInvoicePdf(invoiceId);
}
