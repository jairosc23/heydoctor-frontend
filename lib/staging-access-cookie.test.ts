import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { NextRequest } from "next/server";

import { getAuthEdgeUrl } from "./auth-edge";
import {
  accessCookieNameForHost,
  middleware,
  normalizedRequestHost,
  sessionProbeUrl,
} from "../middleware";

const STAGING = "staging-app.heydoctor.health";
const PRODUCTION = "app.heydoctor.health";

function unsignedJwt(claims: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64url",
  );
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${header}.${payload}.x`;
}

function futureExp(): number {
  return Math.floor(Date.now() / 1000) + 600;
}

function pastExp(): number {
  return Math.floor(Date.now() / 1000) - 120;
}

async function portal(options: {
  urlHost?: string;
  hostHeader?: string;
  forwardedHost?: string;
  cookie?: string;
  path?: string;
}) {
  const headers = new Headers();
  if (options.cookie) headers.set("cookie", options.cookie);
  if (options.hostHeader) headers.set("host", options.hostHeader);
  if (options.forwardedHost) {
    headers.set("x-forwarded-host", options.forwardedHost);
  }
  const response = await middleware(
    new NextRequest(
      `http://${options.urlHost ?? "localhost:8080"}${options.path ?? "/portal"}`,
      { headers },
    ),
  );
  return {
    status: response.status,
    location: response.headers.get("location"),
  };
}

describe("staging access cookie selection", () => {
  const previous = process.env.NEXT_PUBLIC_HD_API_AUTH;
  const previousApi = process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL;
  const previousFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = previousFetch;
    if (previous === undefined) delete process.env.NEXT_PUBLIC_HD_API_AUTH;
    else process.env.NEXT_PUBLIC_HD_API_AUTH = previous;
    if (previousApi === undefined) delete process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL;
    else process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = previousApi;
  });

  it("uses the staging cookie only on the exact staging host with the proxy flag", () => {
    assert.equal(normalizedRequestHost("Staging-App.HeyDoctor.Health:443"), STAGING);
    assert.equal(normalizedRequestHost("staging-app.heydoctor.health."), STAGING);
    assert.equal(normalizedRequestHost("staging-app.heydoctor.health, evil.example"), "");
    assert.equal(normalizedRequestHost(null), "");
    assert.equal(accessCookieNameForHost(STAGING, true), "hd_stg_access_token");
    assert.equal(accessCookieNameForHost(STAGING, false), "access_token");
    assert.equal(accessCookieNameForHost(PRODUCTION, true), "access_token");
    assert.equal(accessCookieNameForHost("localhost", true), "access_token");
    assert.equal(
      accessCookieNameForHost("staging-app.heydoctor.health.example", true),
      "access_token",
    );
  });

  it("allows a valid staging session behind the localhost proxy and redirects when it is missing, invalid, or expired", async () => {
    process.env.NEXT_PUBLIC_HD_API_AUTH = "1";
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = "https://staging-api.heydoctor.health";
    let probe = "";
    let cookieName = "";
    globalThis.fetch = async (input, init) => {
      probe = String(input);
      cookieName = String(
        new Headers(init?.headers).get("cookie") ?? "",
      ).split("=")[0];
      return new Response("{}", { status: 200 });
    };
    const valid = unsignedJwt({ exp: futureExp(), role: "patient" });
    const open = await portal({
      hostHeader: `${STAGING}:443`,
      cookie: `hd_stg_access_token=${valid}`,
    });
    assert.equal(open.status, 200);
    assert.equal(open.location, null);
    assert.equal(probe, "https://staging-api.heydoctor.health/api/auth/me");
    assert.equal(probe.includes("localhost"), false);
    assert.equal(cookieName, "hd_stg_access_token");

    const missing = await portal({ hostHeader: STAGING });
    assert.equal(missing.status, 307);
    assert.match(missing.location ?? "", /\/login\?redirect=%2Fportal$/);

    const invalid = await portal({
      hostHeader: STAGING,
      cookie: "hd_stg_access_token=not-a-jwt",
    });
    assert.equal(invalid.status, 307);

    const expired = await portal({
      hostHeader: STAGING,
      cookie: `hd_stg_access_token=${unsignedJwt({ exp: pastExp(), role: "patient" })}`,
    });
    assert.equal(expired.status, 307);

    const productionCookie = await portal({
      hostHeader: STAGING,
      cookie: `access_token=${valid}`,
    });
    assert.equal(productionCookie.status, 307);
  });

  it("ignores the staging cookie when the flag is off, the host is foreign, or only X-Forwarded-Host matches", async () => {
    const valid = unsignedJwt({ exp: futureExp(), role: "patient" });
    process.env.NEXT_PUBLIC_HD_API_AUTH = "0";
    const flaggedOff = await portal({
      hostHeader: STAGING,
      cookie: `hd_stg_access_token=${valid}`,
    });
    assert.equal(flaggedOff.status, 307);

    process.env.NEXT_PUBLIC_HD_API_AUTH = "1";
    const otherHost = await portal({
      hostHeader: "evil.example",
      cookie: `hd_stg_access_token=${valid}`,
    });
    assert.equal(otherHost.status, 307);

    const lookalike = await portal({
      hostHeader: "staging-app.heydoctor.health.example",
      cookie: `hd_stg_access_token=${valid}`,
    });
    assert.equal(lookalike.status, 307);

    const forwardedOnly = await portal({
      hostHeader: "localhost:8080",
      forwardedHost: STAGING,
      cookie: `hd_stg_access_token=${valid}`,
    });
    assert.equal(forwardedOnly.status, 307);

    const productionIgnored = await portal({
      hostHeader: PRODUCTION,
      cookie: `hd_stg_access_token=${valid}`,
    });
    assert.equal(productionIgnored.status, 307);

    process.env.NEXT_PUBLIC_HD_API_AUTH = "0";
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = "https://pro-api.heydoctor.health";
    let productionProbe = "";
    globalThis.fetch = async (input) => {
      productionProbe = String(input);
      return new Response("{}", { status: 200 });
    };
    const production = await portal({
      hostHeader: PRODUCTION,
      cookie: `access_token=${valid}`,
    });
    assert.equal(production.status, 200);
    assert.equal(production.location, null);
    assert.equal(productionProbe, "https://pro-api.heydoctor.health/api/auth/me");
    assert.equal(
      sessionProbeUrl("http://localhost:8080/portal", false),
      "https://pro-api.heydoctor.health/api/auth/me",
    );
  });

  it("sends a retained access token to the session probe and closes the portal when that session is revoked", async () => {
    process.env.NEXT_PUBLIC_HD_API_AUTH = "1";
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = "https://staging-api.heydoctor.health";
    const valid = unsignedJwt({ exp: futureExp(), role: "patient" });
    let cookieName = "";
    let probe = "";
    globalThis.fetch = async (input, init) => {
      probe = String(input);
      cookieName = String(
        (init && typeof init === "object" && "headers" in init
          ? new Headers(init.headers as HeadersInit).get("cookie")
          : "") ?? "",
      ).split("=")[0];
      return new Response("{}", { status: 401 });
    };
    const closed = await portal({
      hostHeader: STAGING,
      cookie: `hd_stg_access_token=${valid}`,
    });
    assert.equal(closed.status, 307);
    assert.match(closed.location ?? "", /\/login\?redirect=%2Fportal$/);
    assert.equal(cookieName, "hd_stg_access_token");
    assert.equal(probe, "https://staging-api.heydoctor.health/api/auth/me");
    assert.equal(
      sessionProbeUrl("http://localhost:8080/portal", true),
      "https://staging-api.heydoctor.health/api/auth/me",
    );

    globalThis.fetch = async () => {
      throw new TypeError("connect ECONNREFUSED");
    };
    const unreachable = await portal({
      hostHeader: STAGING,
      cookie: `hd_stg_access_token=${valid}`,
    });
    assert.equal(unreachable.status, 307);
  });

  it("keeps email verification public without a session", async () => {
    process.env.NEXT_PUBLIC_HD_API_AUTH = "1";
    const page = await portal({
      hostHeader: STAGING,
      path: "/verificar-correo",
    });
    assert.equal(page.status, 200);
    assert.equal(page.location, null);
  });

  it("sends login, refresh, me, and logout through /hd-api only when the flag is on", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = "https://staging-api.heydoctor.health";
    delete process.env.NEXT_PUBLIC_HD_API_AUTH;
    for (const path of ["/auth/login", "/auth/refresh", "/auth/me", "/auth/logout"]) {
      assert.equal(
        getAuthEdgeUrl(path),
        `https://staging-api.heydoctor.health/api${path}`,
      );
    }

    process.env.NEXT_PUBLIC_HD_API_AUTH = "1";
    assert.equal(getAuthEdgeUrl("/auth/login"), "/hd-api/auth/login");
    assert.equal(getAuthEdgeUrl("/auth/refresh"), "/hd-api/auth/refresh");
    assert.equal(getAuthEdgeUrl("/auth/me"), "/hd-api/auth/me");
    assert.equal(getAuthEdgeUrl("/auth/logout"), "/hd-api/auth/logout");
  });
});
