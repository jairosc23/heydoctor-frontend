import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PAYMENT_UNAVAILABLE_USER_MESSAGE,
  isLeakyPaymentMessage,
  sanitizePaymentApiMessage,
  toPaymentUserMessage,
} from "./payment-user-errors";

describe("payment-user-errors", () => {
  it("flags provider/config leaks", () => {
    assert.equal(
      isLeakyPaymentMessage("Payment provider not configured"),
      true,
    );
    assert.equal(
      isLeakyPaymentMessage("start-checkout HTTP 500: Payment provider"),
      true,
    );
    assert.equal(isLeakyPaymentMessage("No se pudo iniciar el pago"), false);
  });

  it("maps 500 and leaky errors to friendly copy", () => {
    assert.equal(
      toPaymentUserMessage({
        status: 500,
        message: "Payment provider not configured",
      }),
      PAYMENT_UNAVAILABLE_USER_MESSAGE,
    );
    assert.equal(
      toPaymentUserMessage(
        new Error("start-checkout HTTP 500: Payment provider not configured"),
      ),
      PAYMENT_UNAVAILABLE_USER_MESSAGE,
    );
  });

  it("sanitizes API message arrays", () => {
    assert.equal(
      sanitizePaymentApiMessage("Payment provider not configured", 500),
      PAYMENT_UNAVAILABLE_USER_MESSAGE,
    );
  });
});
