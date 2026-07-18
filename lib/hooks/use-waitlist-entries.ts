"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { usePanelQueriesEnabled } from "@/lib/hooks/use-panel-list-queries";
import { fetchWaitlistEntries } from "@/lib/services/appointments";

export function waitlistEntriesQueryKey(input: {
  from: string;
  to: string;
  doctorId?: string;
  includeMatchingSlots?: boolean;
}) {
  return [
    "appointments",
    "waitlist",
    input.from,
    input.to,
    input.doctorId ?? "clinic",
    input.includeMatchingSlots === false ? "no-enrich" : "enrich",
  ] as const;
}

/**
 * List waitlist entries for the visible agenda range (SSOT GET /appointments/waitlist).
 * Enriched with matchingSlotAvailable from Availability/Slots/Blocks engine
 * unless `includeMatchingSlots` is false (W3 dashboard light path).
 */
export function useWaitlistEntriesQuery(input: {
  from: string;
  to: string;
  doctorId?: string;
  enabled?: boolean;
  includeMatchingSlots?: boolean;
}) {
  const { user } = useAuth();
  const panelEnabled = usePanelQueriesEnabled();
  const isDoctor = user?.role === "doctor";
  const isAdmin = user?.role === "admin";
  const doctorId = isDoctor ? undefined : input.doctorId;
  const includeMatchingSlots = input.includeMatchingSlots !== false;

  return useQuery({
    queryKey: waitlistEntriesQueryKey({
      from: input.from,
      to: input.to,
      doctorId: doctorId ?? (isDoctor ? user?.id : undefined),
      includeMatchingSlots,
    }),
    enabled: panelEnabled && (input.enabled ?? true) && (isDoctor || isAdmin),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
    queryFn: () =>
      fetchWaitlistEntries({
        from: input.from,
        to: input.to,
        doctorId,
        includeMatchingSlots,
      }),
  });
}
