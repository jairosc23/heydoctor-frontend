import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  availabilitySlotsQueryRange,
  buildWeeklyWindows,
  formatMinutesAsClock,
  summarizeAvailability,
} from "./availability-summary";

describe("availability-summary (Agenda Enterprise Phase 1)", () => {
  it("formats minutes as HH:mm", () => {
    assert.equal(formatMinutesAsClock(0), "00:00");
    assert.equal(formatMinutesAsClock(9 * 60 + 30), "09:30");
    assert.equal(formatMinutesAsClock(21 * 60), "21:00");
  });

  it("summarizes fallback when no active rules", () => {
    const s = summarizeAvailability([], []);
    assert.equal(s.mode, "fallback_hours");
    assert.equal(s.activeRules, 0);
    assert.equal(s.freeSlotsInRange, 0);
    assert.equal(s.nextSlotStartsAt, null);
  });

  it("summarizes enterprise rules and next slot", () => {
    const s = summarizeAvailability(
      [
        {
          id: "r1",
          clinicId: "c1",
          doctorId: "d1",
          dayOfWeek: 1,
          startMinutes: 540,
          endMinutes: 720,
          effectiveFrom: null,
          effectiveUntil: null,
          isActive: true,
        },
      ],
      [
        {
          startsAt: "2026-07-20T14:00:00.000Z",
          endsAt: "2026-07-20T14:30:00.000Z",
          doctorId: "d1",
        },
        {
          startsAt: "2026-07-20T13:00:00.000Z",
          endsAt: "2026-07-20T13:30:00.000Z",
          doctorId: "d1",
        },
      ],
    );
    assert.equal(s.mode, "enterprise_rules");
    assert.equal(s.activeRules, 1);
    assert.equal(s.freeSlotsInRange, 2);
    assert.equal(s.nextSlotStartsAt, "2026-07-20T13:00:00.000Z");
    assert.deepEqual(buildWeeklyWindows([
      {
        id: "r1",
        clinicId: "c1",
        doctorId: "d1",
        dayOfWeek: 1,
        startMinutes: 540,
        endMinutes: 720,
        effectiveFrom: null,
        effectiveUntil: null,
        isActive: true,
      },
    ]), ["Lun 09:00–12:00"]);
  });

  it("narrows month slot query to ~one week around anchor", () => {
    const range = availabilitySlotsQueryRange(
      "2026-07-01T00:00:00.000Z",
      "2026-07-31T23:59:59.999Z",
      "month",
      "2026-07-15T12:00:00.000Z",
    );
    const spanMs =
      new Date(range.to).getTime() - new Date(range.from).getTime();
    assert.ok(spanMs <= 8 * 24 * 60 * 60 * 1000);
    assert.ok(spanMs > 0);
  });
});
