import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { paymentIdFromHash, paymentPresentation, requirePaymentRecord } from "./return-contract";

const id = "abbbbbbb-1111-4111-8111-111111111111";
describe("clinical Stripe return authority", () => {
  it("accepts only a bare UUID v4 fragment, never a success assertion", () => {
    assert.equal(paymentIdFromHash(`#${id.toUpperCase()}`), id);
    for (const hash of ["", id, "#paid", "#payment=success", `#${id}?payment=success`, `#${id}&status=paid`, "#https://example.com", "#../paid", `#${id.replace('-4111-', '-1111-')}`]) {
      assert.equal(paymentIdFromHash(hash), null);
    }
  });
  it("requires the persisted row to match the requested transaction", () => {
    assert.deepEqual(requirePaymentRecord({ paymentId: id, status: "paid" }, id), { paymentId: id, status: "paid" });
    for (const value of [null, {}, { paymentId: id, status: "success" }, { paymentId: id, isPaid: true }, { paymentId: "bbbbbbbb-2222-4222-8222-222222222222", status: "paid" }]) {
      assert.throws(() => requirePaymentRecord(value, id));
    }
  });
  it("maps every persisted status and has no clinical lock command", () => {
    assert.equal(paymentPresentation("paid").state, "approved");
    assert.equal(paymentPresentation("pending").state, "pending");
    for (const status of ["failed", "cancelled", "expired"] as const) {
      assert.equal(paymentPresentation(status).state, "declined");
    }
  });
});
