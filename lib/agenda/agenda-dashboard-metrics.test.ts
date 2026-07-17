import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAgendaDashboardMetrics,
  formatHoursLabel,
} from "./agenda-dashboard-metrics";

describe("agenda-dashboard-metrics (Agenda Enterprise Phase 9)", () => {
  it("aggregates free hours from slots and occupancy from appointments", () => {
    const metrics = buildAgendaDashboardMetrics({
      appointments: [
        {
          id: "a1",
          startsAt: "2026-07-20T14:00:00.000Z",
          endsAt: "2026-07-20T14:30:00.000Z",
          calendarStatus: "CONFIRMED",
        },
      ],
      slots: [
        {
          startsAt: "2026-07-20T15:00:00.000Z",
          endsAt: "2026-07-20T16:00:00.000Z",
          doctorId: "d1",
        },
      ],
      rules: [{ id: "r1", isActive: true, dayOfWeek: 1, startMinutes: 540, endMinutes: 720 } as never],
      summary: {
        mode: "enterprise_rules",
        activeRules: 1,
        freeSlotsInRange: 1,
        nextSlotStartsAt: "2026-07-20T15:00:00.000Z",
        weeklyWindows: ["Lun 09:00–12:00"],
      },
      blocks: [{ id: "b1", isActive: true } as never],
      waitlist: [{ id: "w1", status: "active" } as never, { id: "w2", status: "cancelled" } as never],
      reminders: [
        { id: "m1", status: "scheduled" } as never,
        { id: "m2", status: "sent" } as never,
      ],
      reminderPolicies: [{ id: "p1", isActive: true } as never],
      timezone: "America/Santiago",
      timezoneSource: "ssot",
      requiresDoctorId: false,
      hasAppointmentsError: false,
      hasAvailabilityError: false,
      nowIso: "2026-07-20T10:00:00.000Z",
    });

    assert.equal(metrics.freeSlotCount, 1);
    assert.equal(metrics.freeHoursApprox, 1);
    assert.equal(metrics.occupiedHoursApprox, 0.5);
    assert.equal(metrics.waitlistActive, 1);
    assert.equal(metrics.remindersScheduled, 1);
    assert.equal(metrics.remindersSent, 1);
    assert.equal(metrics.upcomingAppointments.length, 1);
    assert.equal(metrics.healthTone, "warning");
  });

  it("marks health as warning when admin lacks doctor", () => {
    const metrics = buildAgendaDashboardMetrics({
      appointments: [],
      slots: [],
      rules: [],
      summary: undefined,
      blocks: [],
      waitlist: [],
      reminders: [],
      reminderPolicies: [],
      timezone: "UTC",
      timezoneSource: "browser",
      requiresDoctorId: true,
      hasAppointmentsError: false,
      hasAvailabilityError: false,
    });
    assert.equal(metrics.healthLabel, "Pendiente de médico");
    assert.equal(formatHoursLabel(0), "0 h");
  });
});
