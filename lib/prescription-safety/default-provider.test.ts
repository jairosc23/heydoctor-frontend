import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDefaultSafetyProvider, isSafetyMockEnabled } from "./default-provider";
import { HttpSafetyProvider } from "./http-provider";
import { MockSafetyProvider } from "./mock-provider";

describe("createDefaultSafetyProvider", () => {
  it("uses HttpSafetyProvider when mock flag is off", () => {
    const prev = process.env.NEXT_PUBLIC_SAFETY_MOCK;
    delete process.env.NEXT_PUBLIC_SAFETY_MOCK;
    try {
      if (process.env.NODE_ENV === "production") {
        assert.equal(isSafetyMockEnabled(), false);
      }
      const provider = createDefaultSafetyProvider();
      if (!isSafetyMockEnabled()) {
        assert.ok(provider instanceof HttpSafetyProvider);
      } else {
        assert.ok(provider instanceof MockSafetyProvider);
      }
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_SAFETY_MOCK;
      else process.env.NEXT_PUBLIC_SAFETY_MOCK = prev;
    }
  });
});
