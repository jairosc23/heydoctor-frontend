import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isClientHardDeniedJourneyTransition } from "./legal-transitions.ts";

describe("journey legal-transitions (client mirror)", () => {
  it("denies Assisting → AwaitingConfirmation", () => {
    assert.equal(
      isClientHardDeniedJourneyTransition("Assisting", "AwaitingConfirmation"),
      true,
    );
  });

  it("denies Assisting → ExecutingOwnedPath", () => {
    assert.equal(
      isClientHardDeniedJourneyTransition("Assisting", "ExecutingOwnedPath"),
      true,
    );
  });

  it("allows Assisting → DisposingAssist path conceptually (not hard-denied)", () => {
    assert.equal(
      isClientHardDeniedJourneyTransition("Assisting", "DisposingAssist"),
      false,
    );
  });
});
