import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getApiBase,
  getAuthCsrfUrl,
  getAuthLoginUrl,
  getAuthMeUrl,
  getBackendOrigin,
  getServerNestApiBase,
  isHdApiEdgeEnabled,
} from "./api-base";

const ENV_KEYS = [
  "NEXT_PUBLIC_HEYDOCTOR_API_URL",
  "NEXT_PUBLIC_HD_API_EDGE",
  "HEYDOCTOR_API_INTERNAL_URL",
  "NODE_ENV",
] as const;

const snapshot = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof ENV_KEYS)[number], string | undefined>;

afterEach(() => {
  const env = process.env as Record<string, string | undefined>;
  for (const key of ENV_KEYS) {
    const value = snapshot[key];
    if (value === undefined) {
      delete env[key];
    } else {
      env[key] = value;
    }
  }
});

describe("isHdApiEdgeEnabled", () => {
  it("defaults OFF when unset or empty", () => {
    assert.equal(isHdApiEdgeEnabled(undefined), false);
    assert.equal(isHdApiEdgeEnabled(""), false);
    assert.equal(isHdApiEdgeEnabled("0"), false);
    assert.equal(isHdApiEdgeEnabled("false"), false);
    assert.equal(isHdApiEdgeEnabled("off"), false);
  });

  it("enables only with explicit truthy values", () => {
    assert.equal(isHdApiEdgeEnabled("1"), true);
    assert.equal(isHdApiEdgeEnabled("true"), true);
    assert.equal(isHdApiEdgeEnabled("on"), true);
    assert.equal(isHdApiEdgeEnabled("yes"), true);
  });
});

describe("getApiBase dual URL", () => {
  it("keeps Nest absolute /api when flag is OFF", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = "https://pro-api.heydoctor.health";
    delete process.env.NEXT_PUBLIC_HD_API_EDGE;
    assert.equal(getApiBase(), "https://pro-api.heydoctor.health/api");
    assert.equal(
      getAuthMeUrl(),
      "https://pro-api.heydoctor.health/api/auth/me",
    );
    assert.equal(
      getAuthLoginUrl(),
      "https://pro-api.heydoctor.health/api/auth/login",
    );
    assert.equal(
      getAuthCsrfUrl(),
      "https://pro-api.heydoctor.health/api/auth/csrf",
    );
  });

  it("returns /hd-api when flag is ON", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = "https://pro-api.heydoctor.health";
    process.env.NEXT_PUBLIC_HD_API_EDGE = "1";
    assert.equal(getApiBase(), "/hd-api");
    assert.equal(getAuthMeUrl(), "/hd-api/auth/me");
  });

  it("does not change getBackendOrigin when flag is ON", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = "https://pro-api.heydoctor.health";
    process.env.NEXT_PUBLIC_HD_API_EDGE = "1";
    assert.equal(getBackendOrigin(), "https://pro-api.heydoctor.health");
  });
});

describe("getServerNestApiBase", () => {
  it("stays on Nest /api when the browser flag is ON", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = "https://pro-api.heydoctor.health";
    process.env.NEXT_PUBLIC_HD_API_EDGE = "1";
    delete process.env.HEYDOCTOR_API_INTERNAL_URL;
    assert.equal(
      getServerNestApiBase(),
      "https://pro-api.heydoctor.health/api",
    );
    assert.notEqual(getServerNestApiBase(), "/hd-api");
  });

  it("prefers HEYDOCTOR_API_INTERNAL_URL", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = "https://pro-api.heydoctor.health";
    process.env.HEYDOCTOR_API_INTERNAL_URL = "http://localhost:3001";
    process.env.NEXT_PUBLIC_HD_API_EDGE = "1";
    assert.equal(getServerNestApiBase(), "http://localhost:3001/api");
  });
});
