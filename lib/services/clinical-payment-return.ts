export const CLINICAL_PAYMENT_RETURN_STORAGE_KEY =
  "hd_clinical_payment_return";

export type ClinicalPaymentReturnState =
  | {
      kind: "consultation";
      paymentId: string;
      consultationId: string;
    }
  | {
      kind: "appointment";
      paymentId: string;
      appointmentId: string;
    }
  | {
      kind: "booking";
      paymentId: string;
      bookingToken: string;
      simulated?: boolean;
    };

function storage(): Storage | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage;
}

export function retainClinicalPaymentReturn(
  state: ClinicalPaymentReturnState,
): void {
  const store = storage();
  if (!store) return;
  store.setItem(CLINICAL_PAYMENT_RETURN_STORAGE_KEY, JSON.stringify(state));
}

export function readClinicalPaymentReturn(): ClinicalPaymentReturnState | null {
  const store = storage();
  if (!store) return null;
  const raw = store.getItem(CLINICAL_PAYMENT_RETURN_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ClinicalPaymentReturnState;
    if (!parsed || typeof parsed !== "object" || !parsed.kind || !parsed.paymentId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearClinicalPaymentReturn(): void {
  storage()?.removeItem(CLINICAL_PAYMENT_RETURN_STORAGE_KEY);
}

export function clinicalStripeReturnUrl(origin: string, paymentId: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/payments/return?paymentId=${encodeURIComponent(paymentId)}`;
}

export function stripeReturnUrlContainsPatientPhi(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    const query = parsed.search.toLowerCase();
    if (path.includes("/dr/booking/")) return true;
    if (path.includes("/panel/consultas/")) return true;
    if (query.includes("consultationid=")) return true;
    if (query.includes("appointmentid=")) return true;
    if (query.includes("bookingtoken=")) return true;
    return false;
  } catch {
    return true;
  }
}

export function isSimulatedCheckoutUrl(paymentUrl: string): boolean {
  return !paymentUrl.includes("checkout.stripe.com");
}
