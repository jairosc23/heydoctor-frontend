import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getAuthEdgeBase,
  getAuthEdgeFetchUrl,
  getAuthEdgeUrl,
  isHdApiAuthEnabled,
} from "./auth-edge";
import { getApiBase, getBackendOrigin } from "./api-base";

const ENV_KEYS = [
  "NEXT_PUBLIC_HEYDOCTOR_API_URL",
  "NEXT_PUBLIC_HD_API_AUTH",
  "NEXT_PUBLIC_HD_API_EDGE",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const snapshot = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof ENV_KEYS)[number], string | undefined>;

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = snapshot[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("isHdApiAuthEnabled", () => {
  it("defaults OFF", () => {
    assert.equal(isHdApiAuthEnabled(undefined), false);
    assert.equal(isHdApiAuthEnabled(""), false);
    assert.equal(isHdApiAuthEnabled("0"), false);
    assert.equal(isHdApiAuthEnabled("false"), false);
  });

  it("enables only with explicit truthy values", () => {
    assert.equal(isHdApiAuthEnabled("1"), true);
    assert.equal(isHdApiAuthEnabled("true"), true);
    assert.equal(isHdApiAuthEnabled("on"), true);
  });
});

describe("getAuthEdgeBase", () => {
  it("matches getApiBase when flag is OFF", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL =
      "https://pro-api.heydoctor.health";
    delete process.env.NEXT_PUBLIC_HD_API_AUTH;
    delete process.env.NEXT_PUBLIC_HD_API_EDGE;
    assert.equal(getAuthEdgeBase(), getApiBase());
    assert.equal(
      getAuthEdgeUrl("/auth/login"),
      "https://pro-api.heydoctor.health/api/auth/login",
    );
    assert.equal(
      getAuthEdgeUrl("/auth/refresh"),
      "https://pro-api.heydoctor.health/api/auth/refresh",
    );
    assert.equal(
      getAuthEdgeUrl("/auth/logout"),
      "https://pro-api.heydoctor.health/api/auth/logout",
    );
    assert.equal(
      getAuthEdgeUrl("/auth/csrf"),
      "https://pro-api.heydoctor.health/api/auth/csrf",
    );
    assert.equal(
      getAuthEdgeUrl("/auth/me"),
      "https://pro-api.heydoctor.health/api/auth/me",
    );
  });

  it("uses /hd-api when flag is ON without flipping the hub flag", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL =
      "https://pro-api.heydoctor.health";
    process.env.NEXT_PUBLIC_HD_API_AUTH = "1";
    delete process.env.NEXT_PUBLIC_HD_API_EDGE;
    assert.equal(getAuthEdgeBase(), "/hd-api");
    assert.equal(getApiBase(), "https://pro-api.heydoctor.health/api");
    assert.equal(getBackendOrigin(), "https://pro-api.heydoctor.health");
    assert.equal(getAuthEdgeUrl("/auth/login"), "/hd-api/auth/login");
    assert.equal(getAuthEdgeUrl("/auth/refresh"), "/hd-api/auth/refresh");
    assert.equal(getAuthEdgeUrl("/auth/logout"), "/hd-api/auth/logout");
    assert.equal(getAuthEdgeUrl("/auth/csrf"), "/hd-api/auth/csrf");
    assert.equal(getAuthEdgeUrl("/auth/me"), "/hd-api/auth/me");
  });

  it("expands /hd-api to an absolute same-origin URL for heydoctorApi", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL =
      "https://pro-api.heydoctor.health";
    process.env.NEXT_PUBLIC_HD_API_AUTH = "1";
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.heydoctor.health";
    assert.equal(
      getAuthEdgeFetchUrl("/auth/me"),
      "https://app.heydoctor.health/hd-api/auth/me",
    );
  });
});
