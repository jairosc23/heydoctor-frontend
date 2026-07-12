/**
 * GA-FIX BUG-1 — Deep-link stability after authenticated /login bounce.
 *
 * Asserts Edge middleware Location (no follow): session +
 * `/login?redirect=.../medical-copilot` must never collapse to bare `/panel`.
 */
import { test, expect } from "@playwright/test";

const CONSULTATION_ID = "e2e-ga-fix-consultation";
const DEEP_LINK = `/panel/consultas/${CONSULTATION_ID}/medical-copilot`;

function fakeSessionJwt(ttlSeconds = 60 * 60): string {
  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    sub: "e2e-ga-fix",
    exp,
  })}.e2e`;
}

test.describe("GA-FIX BUG-1 deep-link middleware", () => {
  test("Location preserves medical-copilot redirect (single hop)", async ({
    request,
    baseURL,
  }) => {
    const origin = baseURL ?? "http://localhost:3000";
    const res = await request.get(
      `${origin}/login?redirect=${encodeURIComponent(DEEP_LINK)}`,
      {
        headers: {
          Cookie: `heydoctor_session=${fakeSessionJwt()}`,
        },
        maxRedirects: 0,
      },
    );

    expect([302, 303, 307, 308]).toContain(res.status());
    const location = res.headers().location ?? "";
    expect(location).toContain(`${CONSULTATION_ID}/medical-copilot`);
    expect(location).not.toMatch(/\/panel\/?$/);
    expect(location).not.toContain("/login");
  });

  test("five cold requests never redirect to bare /panel", async ({
    request,
    baseURL,
  }) => {
    const origin = baseURL ?? "http://localhost:3000";
    for (let i = 0; i < 5; i++) {
      // Fresh cookie jar per cold start (no bounce marker).
      const res = await request.get(
        `${origin}/login?redirect=${encodeURIComponent(DEEP_LINK)}`,
        {
          headers: {
            Cookie: `heydoctor_session=${fakeSessionJwt()}`,
          },
          maxRedirects: 0,
        },
      );
      expect([302, 303, 307, 308]).toContain(res.status());
      const location = res.headers().location ?? "";
      expect(location).toContain("/medical-copilot");
      expect(location.endsWith("/panel") || /\/panel\/?$/.test(location)).toBe(
        false,
      );
    }
  });

  test("second bounce clears stale SSR cookie instead of looping", async ({
    request,
    baseURL,
  }) => {
    const origin = baseURL ?? "http://localhost:3000";
    const jwt = fakeSessionJwt();
    const first = await request.get(
      `${origin}/login?redirect=${encodeURIComponent(DEEP_LINK)}`,
      {
        headers: { Cookie: `heydoctor_session=${jwt}` },
        maxRedirects: 0,
      },
    );
    expect([302, 303, 307, 308]).toContain(first.status());
    const setCookie = first.headers()["set-cookie"] ?? "";
    expect(setCookie.toLowerCase()).toContain("hd_deeplink_bounce");

    const second = await request.get(
      `${origin}/login?redirect=${encodeURIComponent(DEEP_LINK)}`,
      {
        headers: {
          Cookie: `heydoctor_session=${jwt}; hd_deeplink_bounce=${DEEP_LINK}`,
        },
        maxRedirects: 0,
      },
    );
    // Stay on /login (no redirect loop) after clearing stale SSR session.
    expect(second.status()).toBe(200);
  });
});
