import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appointmentsToOccupiedSlots,
  filterSlotsByHourRange,
  freeSlotsToDisplay,
  groupSlotsByDay,
  mergeAndSortSlots,
  slotsSummary,
} from "./slots-view-model";

describe("slots-view-model (Agenda Enterprise Phase 3)", () => {
  it("maps appointments to occupied slots and skips cancelled", () => {
    const occupied = appointmentsToOccupiedSlots(
      [
        {
          id: "a1",
          doctorId: "d1",
          startsAt: "2026-07-20T13:00:00.000Z",
          endsAt: "2026-07-20T13:30:00.000Z",
          status: "CONFIRMED",
        },
        {
          id: "a2",
          doctorId: "d1",
          startsAt: "2026-07-20T14:00:00.000Z",
          endsAt: "2026-07-20T14:30:00.000Z",
          status: "CANCELLED",
        },
      ],
      "d1",
    );
    assert.equal(occupied.length, 1);
    assert.equal(occupied[0]?.occupancy, "occupied");
    assert.equal(occupied[0]?.appointmentId, "a1");
  });

  it("merges free + occupied sorted by start", () => {
    const merged = mergeAndSortSlots(
      freeSlotsToDisplay([
        {
          startsAt: "2026-07-20T15:00:00.000Z",
          endsAt: "2026-07-20T15:30:00.000Z",
          doctorId: "d1",
        },
      ]),
      [
        {
          startsAt: "2026-07-20T13:00:00.000Z",
          endsAt: "2026-07-20T13:30:00.000Z",
          doctorId: "d1",
          occupancy: "occupied",
          appointmentId: "a1",
        },
      ],
    );
    assert.equal(merged[0]?.occupancy, "occupied");
    assert.equal(merged[1]?.occupancy, "free");
    assert.deepEqual(slotsSummary(merged), { free: 1, occupied: 1 });
  });

  it("groups by clinic-local day", () => {
    const groups = groupSlotsByDay(
      [
        {
          startsAt: "2026-07-20T15:00:00.000Z",
          endsAt: "2026-07-20T15:30:00.000Z",
          doctorId: "d1",
          occupancy: "free",
        },
      ],
      "UTC",
    );
    assert.equal(groups.length, 1);
    assert.equal(groups[0]?.dateKey, "2026-07-20");
    assert.equal(groups[0]?.freeCount, 1);
  });

  it("filters by hour range in timezone", () => {
    const filtered = filterSlotsByHourRange(
      [
        {
          startsAt: "2026-07-20T08:00:00.000Z",
          endsAt: "2026-07-20T08:30:00.000Z",
          doctorId: "d1",
          occupancy: "free",
        },
        {
          startsAt: "2026-07-20T18:00:00.000Z",
          endsAt: "2026-07-20T18:30:00.000Z",
          doctorId: "d1",
          occupancy: "free",
        },
      ],
      "UTC",
      7,
      12,
    );
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.startsAt, "2026-07-20T08:00:00.000Z");
  });
});
