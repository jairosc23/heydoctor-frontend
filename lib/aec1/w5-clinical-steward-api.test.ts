import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import {
  STEWARD_FORBIDDEN_PATHS,
  W5_CLINICAL_AUTHORITY,
  w5ClinicalAckInsight,
  w5ClinicalDismissInsight,
  w5ClinicalListInsights,
} from "./w5-clinical-steward-api";

describe("AEC-1 M1 W5 clinical steward API", () => {
  it("preserves NON_AUTHORITY and forbids confirm/emit/apply paths", () => {
    assert.equal(W5_CLINICAL_AUTHORITY, "NON_AUTHORITY");
    assert.ok(
      STEWARD_FORBIDDEN_PATHS.some((p) => p.includes("confirm")),
    );
    assert.ok(STEWARD_FORBIDDEN_PATHS.some((p) => p.includes("emit")));
    assert.ok(
      STEWARD_FORBIDDEN_PATHS.some((p) => p.includes("apply-to-chart")),
    );
  });

  it("list fail-closed on 403 maps code without throwing", async () => {
    const fetcher = mock.fn(
      async () => new Response(null, { status: 403 }),
    ) as unknown as typeof fetch;
    const res = await w5ClinicalListInsights({ fetcher, baseUrl: "" });
    assert.equal(res.authorityClass, "NON_AUTHORITY");
    assert.equal(res.code, "W5_FLAG_OR_AUTHORITY_DENIED");
    assert.deepEqual(res.insights, []);
  });

  it("dismiss posts only to dismiss endpoint (≠ HAB)", async () => {
    const calls: string[] = [];
    const fetcher = mock.fn(async (input: RequestInfo | URL) => {
      calls.push(String(input));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;
    const res = await w5ClinicalDismissInsight("ins-1", "note", { fetcher });
    assert.equal(res.ok, true);
    assert.ok(calls[0]?.includes("/dismiss"));
    assert.ok(!calls[0]?.includes("confirm"));
    assert.ok(!calls[0]?.includes("emit"));
  });

  it("ack posts only to ack endpoint (≠ HAB)", async () => {
    const calls: string[] = [];
    const fetcher = mock.fn(async (input: RequestInfo | URL) => {
      calls.push(String(input));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;
    const res = await w5ClinicalAckInsight("ins-2", undefined, { fetcher });
    assert.equal(res.ok, true);
    assert.ok(calls[0]?.includes("/ack"));
    assert.ok(!calls[0]?.includes("confirm"));
  });
});
