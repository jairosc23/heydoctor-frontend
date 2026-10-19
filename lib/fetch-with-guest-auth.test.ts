import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  clearGuestSignalingToken,
  setGuestSignalingToken,
} from "./guest-signaling-memory";
import {
  fetchWithGuestAuth,
  GuestAuthError,
} from "./fetch-with-guest-auth";

describe("fetchWithGuestAuth (ARCH-REM-01)", () => {
  beforeEach(() => {
    clearGuestSignalingToken();
  });

  it("throws when guest token is missing", async () => {
    await assert.rejects(
      () => fetchWithGuestAuth("https://example.test/api/webrtc/ice-servers"),
      (err: unknown) => err instanceof GuestAuthError && err.status === 401,
    );
  });

  it("sends Bearer guest token with credentials omit", async () => {
    setGuestSignalingToken("guest.signaling.jwt");
    const calls: Array<{ input: string; init: RequestInit }> = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ input: String(input), init: init ?? {} });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as typeof fetch;

    try {
      await fetchWithGuestAuth("https://example.test/api/webrtc/ice-servers", {
        method: "GET",
      });
      assert.equal(calls.length, 1);
      assert.equal(calls[0]?.init.credentials, "omit");
      const headers = new Headers(calls[0]?.init.headers);
      assert.equal(headers.get("Authorization"), "Bearer guest.signaling.jwt");
    } finally {
      globalThis.fetch = original;
    }
  });
});
