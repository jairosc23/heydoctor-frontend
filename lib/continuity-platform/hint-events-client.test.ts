import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  __hintEventsInFlightForTests,
  __resetHintEventsClientForTests,
  emitContinuityHintEvent,
} from "./hint-events-client";

describe("PR-12 CCP C3 hint-events-client", () => {
  beforeEach(() => {
    __resetHintEventsClientForTests();
    Object.defineProperty(globalThis, "navigator", {
      value: { onLine: true },
      configurable: true,
    });
  });

  it("drops emits while offline (SHOULD)", async () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { onLine: false },
      configurable: true,
    });
    emitContinuityHintEvent({
      eventType: "hint_expanded",
      patientId: "33333333-3333-4333-8333-333333333333",
      hintId: "h1",
    });
    await new Promise((r) => setTimeout(r, 15));
    assert.equal(__hintEventsInFlightForTests(), 0);
  });

  it("fire-and-forget returns immediately (does not throw to caller)", () => {
    assert.doesNotThrow(() => {
      emitContinuityHintEvent({
        eventType: "handoff_requested",
        patientId: "33333333-3333-4333-8333-333333333333",
        handoffId: "hid",
      });
    });
  });
});
