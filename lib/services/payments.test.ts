import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ENTERPRISE_PAYMENT_SESSION_PATH,
  enterprisePaymentStatusPath,
} from "./payments";

describe("M8-D Enterprise consultation payment contract", () => {
  it("routes checkout to the existing Nest /payments controller, not obsolete /payku", () => {
    assert.equal(
      ENTERPRISE_PAYMENT_SESSION_PATH,
      "/payments/create-payment-session",
    );
  });

  it("routes payment status to the existing tenant-protected endpoint", () => {
    assert.equal(
      enterprisePaymentStatusPath("37d726f3-eb96-44c4-8cce-855433aea3ea"),
      "/payments/consultation/37d726f3-eb96-44c4-8cce-855433aea3ea/payment-status",
    );
  });

  it("escapes an arbitrary consultation identifier as a single path component", () => {
    assert.equal(
      enterprisePaymentStatusPath("a/b?c"),
      "/payments/consultation/a%2Fb%3Fc/payment-status",
    );
  });
});
