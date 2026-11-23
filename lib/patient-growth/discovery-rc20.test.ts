import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultAvailabilityWindow,
  formatPublicSlot,
  futurePublicSlot,
} from "./discovery";

describe("RC20 future-only public discovery", () => {
  it("starts the 7-day discovery range at the current instant, never midnight", () => {
    const before = Date.now();
    const { from, to } = defaultAvailabilityWindow(7);
    const after = Date.now();
    assert.ok(Date.parse(from) >= before);
    assert.ok(Date.parse(from) <= after);
    assert.equal(Date.parse(to) - Date.parse(from), 7 * 86_400_000);
  });

  it("does not announce expired, starting-now, malformed or reversed slots", () => {
    const now = new Date("2026-11-23T17:00:00.000Z");
    const slot = (startsAt: string, endsAt: string) => ({ startsAt, endsAt });
    assert.equal(
      futurePublicSlot(
        slot("2026-11-23T12:00:00.000Z", "2026-11-23T12:30:00.000Z"),
        now,
      ),
      false,
    );
    assert.equal(
      futurePublicSlot(
        slot("2026-11-23T17:00:00.000Z", "2026-11-23T17:30:00.000Z"),
        now,
      ),
      false,
    );
    assert.equal(
      futurePublicSlot(
        slot("invalid", "2026-11-23T18:30:00.000Z"),
        now,
      ),
      false,
    );
    assert.equal(
      futurePublicSlot(
        slot("2026-11-23T19:00:00.000Z", "2026-11-23T18:30:00.000Z"),
        now,
      ),
      false,
    );
    assert.equal(
      futurePublicSlot(
        slot("2026-11-23T18:00:00.000Z", "2026-11-23T18:30:00.000Z"),
        now,
      ),
      true,
    );
    assert.equal(futurePublicSlot(null, now), false);
  });

  it("compares absolute instants over Chile DST transitions", () => {
    const now = new Date("2026-09-06T03:30:00.000Z");
    assert.equal(
      futurePublicSlot(
        {
          startsAt: "2026-09-06T02:59:00.000Z",
          endsAt: "2026-09-06T03:29:00.000Z",
        },
        now,
      ),
      false,
    );
    assert.equal(
      futurePublicSlot(
        {
          startsAt: "2026-09-06T04:30:00.000Z",
          endsAt: "2026-09-06T05:00:00.000Z",
        },
        now,
      ),
      true,
    );
    assert.ok(formatPublicSlot("2026-09-06T04:30:00.000Z", "America/Santiago"));
  });
});
