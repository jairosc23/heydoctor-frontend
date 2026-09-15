import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { EPIC3_DAILY_HUB_API_ALLOWLIST } from "../epic3/architecture-contract";
import { consultationAssistUrl } from "./consultation-assist";

const FE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ASSIST_SOURCE = path.join(FE_ROOT, "lib/services/consultation-assist.ts");
const LAYOUT_SOURCE = path.join(FE_ROOT, "app/layout.tsx");
const VERCEL_BFF_ROUTE = path.join(
  FE_ROOT,
  "app/api/ai/consultation-assist/route.ts",
);

const VERCEL_BFF_PATH = "/api/ai/consultation-assist";
const NEST_ASSIST_SUFFIX = "/api/ai/consultation-assist";

const prevApiUrl = process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL;
const prevEdge = process.env.NEXT_PUBLIC_HD_API_EDGE;

afterEach(() => {
  if (prevApiUrl === undefined) {
    delete process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL;
  } else {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL = prevApiUrl;
  }
  if (prevEdge === undefined) {
    delete process.env.NEXT_PUBLIC_HD_API_EDGE;
  } else {
    process.env.NEXT_PUBLIC_HD_API_EDGE = prevEdge;
  }
});

describe("consultation-assist Vercel PHI minimization", () => {
  it("routes to Railway Nest via getApiBase when HD_API_EDGE is OFF", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL =
      "https://pro-api.heydoctor.health";
    delete process.env.NEXT_PUBLIC_HD_API_EDGE;

    const url = consultationAssistUrl();
    assert.equal(
      url,
      "https://pro-api.heydoctor.health/api/ai/consultation-assist",
    );
    assert.equal(url.endsWith(NEST_ASSIST_SUFFIX), true);
    assert.equal(url.includes("app.heydoctor.health"), false);
    assert.equal(url.startsWith("/api/ai/"), false);
  });

  it("does not target the Vercel same-origin BFF even if window origin is the FE host", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL =
      "https://pro-api.heydoctor.health";
    delete process.env.NEXT_PUBLIC_HD_API_EDGE;

    const feOrigin = "https://app.heydoctor.health";
    const vercelBff = `${feOrigin}${VERCEL_BFF_PATH}`;
    const url = consultationAssistUrl();

    assert.notEqual(url, vercelBff);
    assert.equal(url.startsWith(feOrigin), false);
  });

  it("leaves NEXT_PUBLIC_HD_API_EDGE OFF default (no /hd-api) unchanged", () => {
    process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL =
      "https://pro-api.heydoctor.health";
    delete process.env.NEXT_PUBLIC_HD_API_EDGE;

    const url = consultationAssistUrl();
    assert.equal(url.includes("/hd-api"), false);
  });

  it("removes the Vercel consultation-assist route handler", () => {
    assert.equal(existsSync(VERCEL_BFF_ROUTE), false);
  });

  it("drops the Vercel BFF path from the Daily Hub allowlist", () => {
    assert.equal(
      EPIC3_DAILY_HUB_API_ALLOWLIST.includes(
        VERCEL_BFF_PATH as (typeof EPIC3_DAILY_HUB_API_ALLOWLIST)[number],
      ),
      false,
    );
    assert.equal(
      EPIC3_DAILY_HUB_API_ALLOWLIST.includes("/ai/consultation-assist"),
      true,
    );
  });

  it("does not hardcode window.location.origin or the Vercel BFF in the assist client", () => {
    const source = readFileSync(ASSIST_SOURCE, "utf8");
    assert.equal(source.includes("window.location.origin"), false);
    assert.equal(source.includes(VERCEL_BFF_PATH), false);
    assert.equal(source.includes("consultationAssistUrl"), true);
    assert.equal(source.includes("getApiBase()"), true);
  });

  it("removes root @vercel/analytics from the app layout", () => {
    const source = readFileSync(LAYOUT_SOURCE, "utf8");
    assert.equal(source.includes("@vercel/analytics"), false);
    assert.equal(/from ["']@vercel\/analytics/.test(source), false);
    assert.equal(/<Analytics\s*\/>/.test(source), false);
  });
});
