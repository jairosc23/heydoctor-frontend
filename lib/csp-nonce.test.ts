import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCspWithNonce } from "./csp-nonce";

describe("P1-7 CSP Stripe", () => {
  const csp = buildCspWithNonce({ nonce: "test-nonce", isProd: true });

  it("allows Stripe script, connect and checkout/3DS frames", () => {
    assert.match(csp, /script-src[^;]*https:\/\/js\.stripe\.com/);
    assert.match(csp, /connect-src[^;]*https:\/\/api\.stripe\.com/);
    assert.match(csp, /frame-src[^;]*https:\/\/js\.stripe\.com/);
    assert.match(csp, /frame-src[^;]*https:\/\/checkout\.stripe\.com/);
    assert.match(csp, /frame-src[^;]*https:\/\/hooks\.stripe\.com/);
  });

  it("removes Payku from frame-src", () => {
    assert.doesNotMatch(csp, /payku/i);
  });
});
