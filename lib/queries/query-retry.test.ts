import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { shouldRetryFailedQuery } from "./query-retry";

test("shouldRetryFailedQuery never retries HAB 403, 401, 404 or 429", () => {
  assert.equal(shouldRetryFailedQuery(0, new ApiError("hab", 403)), false);
  assert.equal(shouldRetryFailedQuery(0, new ApiError("auth", 401)), false);
  assert.equal(shouldRetryFailedQuery(0, new ApiError("missing", 404)), false);
  assert.equal(shouldRetryFailedQuery(0, new ApiError("rate", 429)), false);
  assert.equal(shouldRetryFailedQuery(0, new ApiError("conflict", 409)), false);
  assert.equal(shouldRetryFailedQuery(0, new ApiError("invalid", 400)), false);
  assert.equal(
    shouldRetryFailedQuery(0, new ApiError("unprocessable", 422)),
    false,
  );
});

test("shouldRetryFailedQuery allows one retry on transient 5xx and network", () => {
  assert.equal(shouldRetryFailedQuery(0, new ApiError("server", 500)), true);
  assert.equal(
    shouldRetryFailedQuery(0, new ApiError("bad gateway", 502)),
    true,
  );
  assert.equal(shouldRetryFailedQuery(0, new ApiError("timeout", 408)), true);
  assert.equal(
    shouldRetryFailedQuery(0, new TypeError("Failed to fetch")),
    true,
  );
  assert.equal(shouldRetryFailedQuery(1, new ApiError("server", 500)), false);
});
