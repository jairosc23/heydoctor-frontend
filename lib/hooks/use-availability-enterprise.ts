"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  availabilitySlotsQueryRange,
  summarizeAvailability,
} from "@/lib/agenda/availability-summary";
import type { AgendaView } from "@/lib/agenda/calendar-utils";
import { usePanelQueriesEnabled } from "@/lib/hooks/use-panel-list-queries";
import {
  fetchAvailabilityRules,
  fetchAvailabilitySlots,
} from "@/lib/services/appointments-availability";

export function availabilityEnterpriseQueryKey(input: {
  from: string;
  to: string;
  clinicTimezone: string;
  doctorId?: string;
  view: AgendaView;
  slotMinutes?: number;
}) {
  return [
    "appointments",
    "availability-enterprise",
    input.view,
    input.from,
    input.to,
    input.clinicTimezone,
    input.doctorId ?? "self",
    input.slotMinutes ?? 30,
  ] as const;
}

/**
 * Load enterprise availability (rules + free slots) from BE SSOT.
 * Doctors omit doctorId (BE resolves to self). Admins require doctorId.
 */
export function useAvailabilityEnterpriseQuery(input: {
  from: string;
  to: string;
  /** ISO instant used to center month slot window (payload cap). */
  anchorIso: string;
  clinicTimezone: string;
  view: AgendaView;
  doctorId?: string;
  slotMinutes?: number;
  enabled?: boolean;
}) {
  const { user } = useAuth();
  const panelEnabled = usePanelQueriesEnabled();
  const isDoctor = user?.role === "doctor";
  const isAdmin = user?.role === "admin";
  const doctorId = isDoctor ? undefined : input.doctorId;
  const canQuery =
    panelEnabled &&
    (input.enabled ?? true) &&
    (isDoctor || (isAdmin && !!doctorId));

  const slotRange = availabilitySlotsQueryRange(
    input.from,
    input.to,
    input.view,
    input.anchorIso,
  );
  const slotMinutes = input.slotMinutes ?? 30;

  return useQuery({
    queryKey: availabilityEnterpriseQueryKey({
      from: slotRange.from,
      to: slotRange.to,
      clinicTimezone: input.clinicTimezone,
      doctorId: doctorId ?? user?.id,
      view: input.view,
      slotMinutes,
    }),
    enabled: canQuery,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const [rules, slots] = await Promise.all([
        fetchAvailabilityRules(doctorId),
        fetchAvailabilitySlots({
          from: slotRange.from,
          to: slotRange.to,
          clinicTimezone: input.clinicTimezone,
          doctorId,
          slotMinutes,
        }),
      ]);
      return {
        rules,
        slots,
        summary: summarizeAvailability(rules, slots),
        slotRange,
        resolvedDoctorId: doctorId ?? user?.id,
        requiresDoctorId: isAdmin && !doctorId,
      };
    },
  });
}
