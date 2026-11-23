import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultAvailabilityWindow,
  formatPublicSlot,
  futurePublicSlot,
} from "./discovery";

describe("RC20 future-only public discovery", () => {
  it("preserves calendar boundaries so appointment slots stay on their grid", () => {
    const before = new Date();
    const { from, to } = defaultAvailabilityWindow(7);
    const after = new Date();
    assert.equal(new Date(from).getHours(), 0);
    assert.equal(new Date(from).getMinutes(), 0);
    assert.equal(new Date(from).getSeconds(), 0);
    assert.ok(Date.parse(from) <= before.getTime());
    assert.ok(Date.parse(to) > after.getTime());
    const calendarEnd = new Date(from);
    calendarEnd.setDate(calendarEnd.getDate() + 7);
    assert.equal(Date.parse(to), calendarEnd.getTime());
    assert.equal(new Date(to).getHours(), 0);
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
      futurePublicSlot(slot("invalid", "2026-11-23T18:30:00.000Z"), now),
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
