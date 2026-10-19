import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GET } from "../app/api/health/route";

describe("GET /api/health", () => {
  it("returns a deterministic frontend liveness payload", async () => {
    const response = GET();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(await response.json(), { ok: true, status: "alive" });
  });
});
