import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PAYMENTS_CONFIG_PATH,
  PAYMENTS_INTENTS_PATH,
  paymentIntentCancelPath,
  paymentIntentPath,
} from "./payment-intents";

describe("payment intents contract", () => {
  it("uses Payment Intent endpoints under /payments", () => {
    assert.equal(PAYMENTS_CONFIG_PATH, "/payments/config");
    assert.equal(PAYMENTS_INTENTS_PATH, "/payments/intents");
    assert.equal(
      paymentIntentPath("11111111-1111-4111-8111-111111111111"),
      "/payments/intents/11111111-1111-4111-8111-111111111111",
    );
    assert.equal(
      paymentIntentCancelPath("11111111-1111-4111-8111-111111111111"),
      "/payments/intents/11111111-1111-4111-8111-111111111111/cancel",
    );
    assert.equal(PAYMENTS_INTENTS_PATH.includes("payku"), false);
    assert.equal(PAYMENTS_INTENTS_PATH.includes("checkout"), false);
  });
});
