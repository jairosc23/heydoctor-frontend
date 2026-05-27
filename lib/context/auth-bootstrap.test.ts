import test from "node:test";
import assert from "node:assert/strict";
import { OperationTimeoutError } from "../async/with-timeout";
import {
  isAuthAbortError,
  isBootstrapTimeoutError,
  shouldClearSessionOnBootstrapError,
  shouldFinishHydrationAfterError,
} from "./auth-bootstrap";

test("isBootstrapTimeoutError detecta OperationTimeoutError", () => {
  assert.equal(
    isBootstrapTimeoutError(
      new OperationTimeoutError("auth-bootstrap-refresh", 15000),
    ),
    true,
  );
  assert.equal(isBootstrapTimeoutError(new Error("other")), false);
});

test("isAuthAbortError detecta AbortError", () => {
  assert.equal(
    isAuthAbortError(new DOMException("aborted", "AbortError")),
    true,
  );
  assert.equal(isAuthAbortError(new Error("fail")), false);
});

test("shouldClearSessionOnBootstrapError no limpia en abort", () => {
  assert.equal(
    shouldClearSessionOnBootstrapError(
      new DOMException("aborted", "AbortError"),
      "refresh",
    ),
    false,
  );
});

test("shouldClearSessionOnBootstrapError solo en fase refresh", () => {
  assert.equal(
    shouldClearSessionOnBootstrapError(new Error("fail"), "refresh"),
    true,
  );
  assert.equal(
    shouldClearSessionOnBootstrapError(
      new OperationTimeoutError("getMe", 15000),
      "getMe",
    ),
    false,
  );
});

test("shouldFinishHydrationAfterError en timeout", () => {
  assert.equal(
    shouldFinishHydrationAfterError(
      new OperationTimeoutError("hydration", 25000),
    ),
    true,
  );
});
