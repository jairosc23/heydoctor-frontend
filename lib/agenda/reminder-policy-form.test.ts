import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyReminderPolicyForm,
  formatOffsetLabel,
  offsetMinutesFromForm,
  validateReminderPolicyForm,
} from "./reminder-policy-form";

describe("reminder-policy-form (Agenda Enterprise Phase 6)", () => {
  it("maps 24h before to -1440 minutes", () => {
    const form = emptyReminderPolicyForm("d1");
    form.offsetAmount = 24;
    form.offsetUnit = "hours";
    form.beforeAnchor = true;
    assert.equal(offsetMinutesFromForm(form), -1440);
    assert.equal(formatOffsetLabel(-1440), "24 h antes");
  });

  it("maps 30 min before to -30", () => {
    const form = emptyReminderPolicyForm("d1");
    form.offsetAmount = 30;
    form.offsetUnit = "minutes";
    form.beforeAnchor = true;
    assert.equal(offsetMinutesFromForm(form), -30);
  });

  it("builds policy payload with channel and type", () => {
    const form = emptyReminderPolicyForm("d1");
    form.type = "no_show_risk";
    form.channel = "sms";
    form.offsetAmount = 2;
    form.offsetUnit = "hours";
    const v = validateReminderPolicyForm(form, { requireDoctorId: true });
    assert.equal(v.ok, true);
    assert.equal(v.payload?.offsetMinutes, -120);
    assert.equal(v.payload?.channel, "sms");
    assert.equal(v.payload?.type, "no_show_risk");
  });
});
