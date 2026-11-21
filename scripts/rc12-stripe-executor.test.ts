import assert from "node:assert/strict";
import { test } from "node:test";
import type { Page } from "@playwright/test";
import { runStripeP0, completeHostedTestCheckout } from "../e2e/helpers/stripe-p0";

// Actual executor entry points, no browser/network. Even reading a page method
// fails this test if financial UI is touched before denied authorization.
for (const name of ["scenario", "hosted submit"] as const) {
  test(`${name} refuses all page interaction without explicit authorization`, async () => {
    assert.notEqual(process.env.RC12_AUTHORIZE_TEST_CHECKOUT, "STRIPE_TEST_ONLY_15000_CLP",
      "Offline tests must never run with transaction authorization");
    let interactions = 0;
    const page = new Proxy({}, { get() { interactions++; throw new Error("Unexpected browser interaction"); } }) as Page;
    const operation = name === "scenario"
      ? runStripeP0(page, "aaaaaaaa-1111-4111-8111-111111111111")
      : completeHostedTestCheckout(page, "aaaaaaaa-1111-4111-8111-111111111111", "https://checkout.stripe.com/c/pay/cs_test_OFFLINE");
    await assert.rejects(operation, /RC12_BLOCKED:authorization/);
    assert.equal(interactions, 0);
  });
}
