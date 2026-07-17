import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clockToMinutes,
  emptyAvailabilityRuleForm,
  minutesToClock,
  ruleToFormState,
  validateAvailabilityRuleForm,
} from "./availability-rule-form";

describe("availability-rule-form (Agenda Enterprise Phase 2)", () => {
  it("converts clock ↔ minutes", () => {
    assert.equal(clockToMinutes("09:30"), 570);
    assert.equal(minutesToClock(570), "09:30");
    assert.equal(clockToMinutes("25:00"), null);
  });

  it("rejects end before start", () => {
    const form = emptyAvailabilityRuleForm();
    form.startTime = "14:00";
    form.endTime = "12:00";
    const v = validateAvailabilityRuleForm(form, { requireDoctorId: false });
    assert.equal(v.ok, false);
    assert.ok(v.errors.some((e) => e.includes("fin")));
  });

  it("requires doctorId for admin", () => {
    const form = emptyAvailabilityRuleForm("");
    const v = validateAvailabilityRuleForm(form, { requireDoctorId: true });
    assert.equal(v.ok, false);
  });

  it("builds create payload from form", () => {
    const form = emptyAvailabilityRuleForm("d1");
    form.dayOfWeek = 2;
    form.startTime = "10:00";
    form.endTime = "12:30";
    form.effectiveFrom = "2026-08-01";
    form.isActive = false;
    const v = validateAvailabilityRuleForm(form, { requireDoctorId: true });
    assert.equal(v.ok, true);
    assert.deepEqual(v.payload, {
      dayOfWeek: 2,
      startMinutes: 600,
      endMinutes: 750,
      effectiveFrom: "2026-08-01",
      isActive: false,
      doctorId: "d1",
    });
  });

  it("maps rule entity to form state", () => {
    const form = ruleToFormState({
      id: "r1",
      clinicId: "c1",
      doctorId: "d1",
      dayOfWeek: 5,
      startMinutes: 480,
      endMinutes: 600,
      effectiveFrom: "2026-01-01",
      effectiveUntil: null,
      isActive: true,
    });
    assert.equal(form.dayOfWeek, 5);
    assert.equal(form.startTime, "08:00");
    assert.equal(form.endTime, "10:00");
    assert.equal(form.effectiveFrom, "2026-01-01");
  });
});
