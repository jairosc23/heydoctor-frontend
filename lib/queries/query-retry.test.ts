import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { shouldRetryFailedQuery } from "./query-retry";

test("shouldRetryFailedQuery no reintenta 429 ni 401", () => {
  assert.equal(shouldRetryFailedQuery(0, new ApiError("rate", 429)), false);
  assert.equal(shouldRetryFailedQuery(0, new ApiError("auth", 401)), false);
});

test("shouldRetryFailedQuery permite un retry en otros errores", () => {
  assert.equal(shouldRetryFailedQuery(0, new ApiError("server", 500)), true);
  assert.equal(shouldRetryFailedQuery(1, new ApiError("server", 500)), false);
});
