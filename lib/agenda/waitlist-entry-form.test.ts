import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyWaitlistEntryForm,
  validateWaitlistEntryForm,
} from "./waitlist-entry-form";

describe("waitlist-entry-form (Agenda Enterprise Phase 5)", () => {
  it("rejects end before start", () => {
    const form = emptyWaitlistEntryForm("d1", "UTC");
    form.patientId = "p1";
    form.preferredFromLocal = "2026-07-20T18:00";
    form.preferredToLocal = "2026-07-20T09:00";
    const v = validateWaitlistEntryForm(form, {
      requireDoctorId: true,
      requirePatientId: true,
      clinicTimezone: "UTC",
    });
    assert.equal(v.ok, false);
  });

  it("builds create payload with priority and reason", () => {
    const form = emptyWaitlistEntryForm("d1", "UTC");
    form.patientId = "11111111-1111-4111-8111-111111111111";
    form.doctorId = "22222222-2222-4222-8222-222222222222";
    form.preferredFromLocal = "2026-07-20T09:00";
    form.preferredToLocal = "2026-07-20T18:00";
    form.priority = 10;
    form.reason = "Hueco cancelado";
    const v = validateWaitlistEntryForm(form, {
      requireDoctorId: true,
      requirePatientId: true,
      clinicTimezone: "UTC",
    });
    assert.equal(v.ok, true);
    assert.equal(v.payload?.priority, 10);
    assert.equal(v.payload?.reason, "Hueco cancelado");
    assert.ok(v.payload?.preferredFrom);
    assert.ok(v.payload?.preferredTo);
  });

  it("requires doctor for admin context", () => {
    const form = emptyWaitlistEntryForm("", "UTC");
    form.patientId = "11111111-1111-4111-8111-111111111111";
    const v = validateWaitlistEntryForm(form, {
      requireDoctorId: true,
      requirePatientId: true,
      clinicTimezone: "UTC",
    });
    assert.equal(v.ok, false);
  });
});
