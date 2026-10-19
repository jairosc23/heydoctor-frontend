import test from "node:test";
import assert from "node:assert/strict";
import {
  subscribeRefreshState,
  forceResetRefreshState,
  consumeLastRefreshTimedOut,
  getRefreshOverlayDepthForTests,
} from "./auth-client";

test("forceResetRefreshState emite sessionRevalidating false a listeners", () => {
  let refreshing = true;
  const unsub = subscribeRefreshState((v) => {
    refreshing = v;
  });

  forceResetRefreshState();
  assert.equal(refreshing, false);
  assert.equal(getRefreshOverlayDepthForTests(), 0);
  unsub();
});

test("consumeLastRefreshTimedOut se consume una vez", () => {
  assert.equal(consumeLastRefreshTimedOut(), false);
});
