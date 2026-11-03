import { heydoctorApi } from "../heydoctor-api";

export interface PaymentSession {
  paymentId: string;
  paymentUrl: string;
}

export async function createPaymentSession(
  consultationId: string
): Promise<PaymentSession> {
  return heydoctorApi.post<PaymentSession>("/payments/create-payment-session", {
    consultationId,
  });
}

export type ConsultationPaymentStatus = {
  isPaid: boolean;
  hasPending: boolean;
  hasFailed: boolean;
};

/** Verificación post-redirect: estado real en BD (no confiar solo en ?payment=). */
export async function fetchConsultationPaymentStatus(
  consultationId: string
): Promise<ConsultationPaymentStatus> {
  return heydoctorApi.get<ConsultationPaymentStatus>(
    `/payments/consultation/${encodeURIComponent(consultationId)}/payment-status`
  );
}
