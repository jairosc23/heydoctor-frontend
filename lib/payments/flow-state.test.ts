import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reducePaymentFlow, resolvePublishableKey } from "./flow-state";

describe("payment flow state", () => {
  it("walks loading → ready → processing → success", () => {
    let status = reducePaymentFlow("idle", { type: "load" });
    assert.equal(status, "loading");
    status = reducePaymentFlow(status, { type: "ready" });
    assert.equal(status, "ready");
    status = reducePaymentFlow(status, { type: "submit" });
    assert.equal(status, "processing");
    status = reducePaymentFlow(status, { type: "success" });
    assert.equal(status, "success");
  });

  it("supports failed → retry and cancel", () => {
    let status = reducePaymentFlow("ready", { type: "fail" });
    assert.equal(status, "failed");
    status = reducePaymentFlow(status, { type: "retry" });
    assert.equal(status, "loading");
    status = reducePaymentFlow("ready", { type: "cancel" });
    assert.equal(status, "cancelled");
  });

  it("prefers the API publishable key over env", () => {
    assert.equal(resolvePublishableKey("pk_test_api"), "pk_test_api");
    assert.equal(
      resolvePublishableKey("  "),
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || null,
    );
  });
});
