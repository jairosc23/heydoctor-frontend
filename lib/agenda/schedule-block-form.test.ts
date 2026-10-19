import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyScheduleBlockForm,
  validateScheduleBlockForm,
} from "./schedule-block-form";

describe("schedule-block-form (Agenda Enterprise Phase 4)", () => {
  it("rejects end before start on range", () => {
    const form = emptyScheduleBlockForm("d1", "UTC");
    form.mode = "range";
    form.startsLocal = "2026-07-20T14:00";
    form.endsLocal = "2026-07-20T13:00";
    const v = validateScheduleBlockForm(form, {
      requireDoctorId: false,
      clinicTimezone: "UTC",
    });
    assert.equal(v.ok, false);
  });

  it("builds full-day payload", () => {
    const form = emptyScheduleBlockForm("d1", "UTC");
    form.mode = "full_day";
    form.dayDate = "2026-07-20";
    form.doctorId = "d1";
    form.reason = "Congreso";
    const v = validateScheduleBlockForm(form, {
      requireDoctorId: true,
      clinicTimezone: "UTC",
    });
    assert.equal(v.ok, true);
    assert.ok(v.payload?.startsAt);
    assert.ok(v.payload?.endsAt);
    assert.equal(v.payload?.reason, "Congreso");
    assert.equal(v.payload?.doctorId, "d1");
  });

  it("allows clinic-wide block without doctorId", () => {
    const form = emptyScheduleBlockForm("", "UTC");
    form.clinicWide = true;
    form.mode = "range";
    form.startsLocal = "2026-07-20T09:00";
    form.endsLocal = "2026-07-20T12:00";
    const v = validateScheduleBlockForm(form, {
      requireDoctorId: true,
      clinicTimezone: "UTC",
    });
    assert.equal(v.ok, true);
    assert.equal(v.payload?.doctorId, undefined);
  });
});
