"use client";

import { useMemo, useState } from "react";
import { formatInClinic } from "@/lib/agenda/calendar-utils";
import {
  appointmentsToOccupiedSlots,
  filterSlotsByHourRange,
  freeSlotsToDisplay,
  groupSlotsByDay,
  mergeAndSortSlots,
  slotsSummary,
  type DisplaySlot,
} from "@/lib/agenda/slots-view-model";
import type { AvailabilitySlot } from "@/lib/services/appointments-availability";
import type { Appointment } from "@/lib/services/appointments";
import { cn } from "@/lib/utils";

type Props = {
  freeSlots: AvailabilitySlot[] | undefined;
  appointments: Appointment[];
  clinicTimezone: string;
  clinicId?: string;
  doctorId?: string;
  isLoading: boolean;
  isError: boolean;
  canQuery: boolean;
  slotRangeLabel?: string;
  onSelectFreeSlot?: (startsAt: Date) => void;
  onSelectOccupied?: (appointmentId: string) => void;
};

const HOUR_PRESETS: { id: string; label: string; from: number; to: number }[] =
  [
    { id: "all", label: "Todo el día", from: 0, to: 24 },
    { id: "am", label: "Mañana (07–13)", from: 7, to: 13 },
    { id: "pm", label: "Tarde (13–21)", from: 13, to: 21 },
  ];

export function AgendaSlotsPanel({
  freeSlots,
  appointments,
  clinicTimezone,
  clinicId,
  doctorId,
  isLoading,
  isError,
  canQuery,
  slotRangeLabel,
  onSelectFreeSlot,
  onSelectOccupied,
}: Props) {
  const [hourPreset, setHourPreset] = useState("all");
  const [showFree, setShowFree] = useState(true);
  const [showOccupied, setShowOccupied] = useState(true);

  const preset =
    HOUR_PRESETS.find((p) => p.id === hourPreset) ?? HOUR_PRESETS[0];

  const groups = useMemo(() => {
    const free = freeSlotsToDisplay(freeSlots ?? []);
    const occupied = appointmentsToOccupiedSlots(appointments, doctorId);
    let merged = mergeAndSortSlots(free, occupied);
    merged = filterSlotsByHourRange(
      merged,
      clinicTimezone,
      preset.from,
      preset.to,
    );
    if (!showFree) merged = merged.filter((s) => s.occupancy !== "free");
    if (!showOccupied)
      merged = merged.filter((s) => s.occupancy !== "occupied");
    return groupSlotsByDay(merged, clinicTimezone);
  }, [
    freeSlots,
    appointments,
    doctorId,
    clinicTimezone,
    preset.from,
    preset.to,
    showFree,
    showOccupied,
  ]);

  const totals = useMemo(() => {
    const all = groups.flatMap((g) => g.slots);
    return slotsSummary(all);
  }, [groups]);

  if (!canQuery) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="font-semibold">Slots enterprise</p>
        <p className="mt-1">
          Seleccione un profesional para consultar slots libres y ocupados
          (SSOT backend).
        </p>
      </section>
    );
  }

  return (
    <section
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900"
      aria-label="Slots de disponibilidad enterprise"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Slots enterprise
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Libres: GET /appointments/availability/slots · Ocupados: citas
            activas
            {slotRangeLabel ? ` · ${slotRangeLabel}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Clínica {clinicId ? clinicId.slice(0, 8) + "…" : "sesión"} ·{" "}
            {totals.free} libres · {totals.occupied} ocupados
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {HOUR_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setHourPreset(p.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold",
                hourPreset === p.id
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
        <label className="inline-flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={showFree}
            onChange={(e) => setShowFree(e.target.checked)}
          />
          Libres
        </label>
        <label className="inline-flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={showOccupied}
            onChange={(e) => setShowOccupied(e.target.checked)}
          />
          Ocupados
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Cargando slots…</p>
      ) : isError ? (
        <p className="text-sm text-rose-700 dark:text-rose-300">
          No se pudieron cargar los slots libres.
        </p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay slots en el rango/filtros actuales.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((day) => (
            <div key={day.dateKey}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-100">
                  {day.label}
                </h3>
                <span className="text-xs text-slate-500">
                  {day.freeCount} libres · {day.occupiedCount} ocupados
                </span>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {day.slots.map((slot) => (
                  <SlotChip
                    key={`${slot.occupancy}-${slot.startsAt}-${slot.appointmentId ?? ""}`}
                    slot={slot}
                    clinicTimezone={clinicTimezone}
                    onSelectFree={onSelectFreeSlot}
                    onSelectOccupied={onSelectOccupied}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function SlotChip({
  slot,
  clinicTimezone,
  onSelectFree,
  onSelectOccupied,
}: {
  slot: DisplaySlot;
  clinicTimezone: string;
  onSelectFree?: (startsAt: Date) => void;
  onSelectOccupied?: (appointmentId: string) => void;
}) {
  const free = slot.occupancy === "free";
  const label = `${formatInClinic(slot.startsAt, clinicTimezone, "HH:mm")}–${formatInClinic(slot.endsAt, clinicTimezone, "HH:mm")}`;

  return (
    <li>
      <button
        type="button"
        disabled={free ? !onSelectFree : !onSelectOccupied || !slot.appointmentId}
        onClick={() => {
          if (free) onSelectFree?.(new Date(slot.startsAt));
          else if (slot.appointmentId) onSelectOccupied?.(slot.appointmentId);
        }}
        className={cn(
          "w-full rounded-xl border px-3 py-2 text-left text-sm transition",
          free
            ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
            : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
        )}
      >
        <span className="font-semibold">{label}</span>
        <span className="mt-0.5 block text-xs opacity-80">
          {free ? "Disponible" : "Ocupado"}
        </span>
      </button>
    </li>
  );
}
