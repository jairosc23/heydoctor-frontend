import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  clearClinicalPaymentReturn,
  clinicalStripeReturnUrl,
  readClinicalPaymentReturn,
  retainClinicalPaymentReturn,
  stripeReturnUrlContainsPatientPhi,
} from "./clinical-payment-return";

class MemoryStorage {
  private readonly map = new Map<string, string>();
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
}

describe("clinical payment return retention", () => {
  beforeEach(() => {
    const memory = new MemoryStorage();
    (globalThis as { sessionStorage: Storage }).sessionStorage =
      memory as unknown as Storage;
  });

  it("retains consultationId client-side and clears after completion", () => {
    retainClinicalPaymentReturn({
      kind: "consultation",
      paymentId: "pay-1",
      consultationId: "consult-1",
    });
    assert.deepEqual(readClinicalPaymentReturn(), {
      kind: "consultation",
      paymentId: "pay-1",
      consultationId: "consult-1",
    });
    clearClinicalPaymentReturn();
    assert.equal(readClinicalPaymentReturn(), null);
  });

  it("retains bookingToken client-side without putting it in the Stripe return URL", () => {
    retainClinicalPaymentReturn({
      kind: "booking",
      paymentId: "pay-2",
      bookingToken: "token-secret",
    });
    const url = clinicalStripeReturnUrl("https://app.heydoctor.health", "pay-2");
    assert.equal(
      url,
      "https://app.heydoctor.health/payments/return?paymentId=pay-2",
    );
    assert.equal(stripeReturnUrlContainsPatientPhi(url), false);
    assert.equal(url.includes("token-secret"), false);
    assert.equal(url.includes("consult"), false);
  });

  it("rejects Stripe return URLs that embed clinical ids or booking tokens", () => {
    assert.equal(
      stripeReturnUrlContainsPatientPhi(
        "https://app.heydoctor.health/panel/consultas/consult-1?payment=success",
      ),
      true,
    );
    assert.equal(
      stripeReturnUrlContainsPatientPhi(
        "https://app.heydoctor.health/dr/booking/token-secret?payment=success",
      ),
      true,
    );
    assert.equal(
      stripeReturnUrlContainsPatientPhi(
        "https://app.heydoctor.health/panel/pagos/intent?consultationId=consult-1",
      ),
      true,
    );
  });
});
