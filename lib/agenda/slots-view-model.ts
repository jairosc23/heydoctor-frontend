import { formatInTimeZone } from "date-fns-tz";
import type { AvailabilitySlot } from "@/lib/services/appointments-availability";
import type { Appointment } from "@/lib/services/appointments";

export type SlotOccupancy = "free" | "occupied";

export type DisplaySlot = {
  startsAt: string;
  endsAt: string;
  doctorId: string;
  occupancy: SlotOccupancy;
  appointmentId?: string;
};

export type SlotsDayGroup = {
  dateKey: string;
  label: string;
  freeCount: number;
  occupiedCount: number;
  slots: DisplaySlot[];
};

/** Map active appointments in range to occupied slot intervals (SSOT: appointments list). */
export function appointmentsToOccupiedSlots(
  appointments: Appointment[],
  doctorId?: string,
): DisplaySlot[] {
  const out: DisplaySlot[] = [];
  for (const a of appointments) {
    const id = a.doctorId ?? a.doctor?.id;
    if (doctorId && id && id !== doctorId) continue;
    if (!a.startsAt || !a.endsAt) continue;
    const status = a.calendarStatus ?? a.status;
    if (
      status === "CANCELLED" ||
      status === "NO_SHOW" ||
      status === "REFUNDED" ||
      a.status === "CANCELLED" ||
      a.status === "NO_SHOW" ||
      a.status === "REFUNDED"
    ) {
      continue;
    }
    out.push({
      startsAt: a.startsAt,
      endsAt: a.endsAt,
      doctorId: id ?? "",
      occupancy: "occupied",
      appointmentId: a.id,
    });
  }
  return out;
}

export function freeSlotsToDisplay(slots: AvailabilitySlot[]): DisplaySlot[] {
  return slots.map((s) => ({
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    doctorId: s.doctorId,
    occupancy: "free" as const,
  }));
}

export function mergeAndSortSlots(
  free: DisplaySlot[],
  occupied: DisplaySlot[],
): DisplaySlot[] {
  return [...free, ...occupied].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
}

/** Keep slots whose start hour (clinic TZ) is within [fromHour, toHour) inclusive start. */
export function filterSlotsByHourRange(
  slots: DisplaySlot[],
  clinicTimezone: string,
  fromHour: number,
  toHour: number,
): DisplaySlot[] {
  return slots.filter((s) => {
    const hour = Number(
      formatInTimeZone(new Date(s.startsAt), clinicTimezone, "H"),
    );
    return hour >= fromHour && hour < toHour;
  });
}

export function groupSlotsByDay(
  slots: DisplaySlot[],
  clinicTimezone: string,
): SlotsDayGroup[] {
  const map = new Map<string, DisplaySlot[]>();
  for (const slot of slots) {
    const dateKey = formatInTimeZone(
      new Date(slot.startsAt),
      clinicTimezone,
      "yyyy-MM-dd",
    );
    const list = map.get(dateKey) ?? [];
    list.push(slot);
    map.set(dateKey, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, daySlots]) => {
      const sorted = [...daySlots].sort((a, b) =>
        a.startsAt.localeCompare(b.startsAt),
      );
      const freeCount = sorted.filter((s) => s.occupancy === "free").length;
      const occupiedCount = sorted.length - freeCount;
      let label = dateKey;
      try {
        label = formatInTimeZone(
          new Date(`${dateKey}T12:00:00Z`),
          clinicTimezone,
          "EEEE d MMM",
        );
      } catch {
        /* keep dateKey */
      }
      return { dateKey, label, freeCount, occupiedCount, slots: sorted };
    });
}

export function slotsSummary(slots: DisplaySlot[]): {
  free: number;
  occupied: number;
} {
  let free = 0;
  let occupied = 0;
  for (const s of slots) {
    if (s.occupancy === "free") free += 1;
    else occupied += 1;
  }
  return { free, occupied };
}
