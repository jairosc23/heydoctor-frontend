import test from "node:test";
import assert from "node:assert/strict";
import type { AuthTelemetryEvent } from "./auth-telemetry";
import {
  trackRefreshAttempt,
  emitSessionAnalytics,
} from "./session-analytics";

test("trackRefreshAttempt emits refresh_storm_detected after threshold", () => {
  const events: string[] = [];
  globalThis.window = {
    __HEYDOCTOR_AUTH_TELEMETRY__: (event: AuthTelemetryEvent) => {
      events.push(event);
    },
  } as unknown as Window & typeof globalThis.window;

  for (let i = 0; i < 4; i++) {
    trackRefreshAttempt({ source: "test" });
  }

  assert.ok(events.includes("refresh_storm_detected"));
});

test("emitSessionAnalytics strips sensitive keys", () => {
  let detail: Record<string, unknown> | undefined;
  globalThis.window = {
    __HEYDOCTOR_AUTH_TELEMETRY__: (
      _event: AuthTelemetryEvent,
      d?: Record<string, unknown>,
    ) => {
      detail = d;
    },
  } as unknown as Window & typeof globalThis.window;

  emitSessionAnalytics("unexpected_logout", {
    pathname: "/panel",
    access_token: "secret",
  });

  assert.equal(detail?.pathname, "/panel");
  assert.equal(detail?.access_token, undefined);
});
