import { heydoctorApi } from "../heydoctor-api";

/** Contrato Nest Enterprise. El nombre de la tabla histórica no es la ruta HTTP. */
export const ENTERPRISE_PAYMENT_SESSION_PATH = "/payments/create-payment-session";

export function enterprisePaymentStatusPath(consultationId: string): string {
  return `/payments/consultation/${encodeURIComponent(consultationId)}/payment-status`;
}

export interface PaymentSession {
  paymentId: string;
  paymentUrl: string;
}

export async function createPaymentSession(
  consultationId: string
): Promise<PaymentSession> {
  return heydoctorApi.post<PaymentSession>(ENTERPRISE_PAYMENT_SESSION_PATH, {
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
