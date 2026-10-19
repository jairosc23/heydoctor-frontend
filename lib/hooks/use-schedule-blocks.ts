"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { usePanelQueriesEnabled } from "@/lib/hooks/use-panel-list-queries";
import { fetchScheduleBlocks } from "@/lib/services/appointments-availability";

export function scheduleBlocksQueryKey(input: {
  from: string;
  to: string;
  doctorId?: string;
}) {
  return [
    "appointments",
    "schedule-blocks",
    input.from,
    input.to,
    input.doctorId ?? "clinic",
  ] as const;
}

/**
 * List schedule blocks for the visible agenda range (SSOT GET /appointments/blocks).
 * Doctors: own + clinic-wide. Admins: optional doctorId filter.
 */
export function useScheduleBlocksQuery(input: {
  from: string;
  to: string;
  doctorId?: string;
  enabled?: boolean;
}) {
  const { user } = useAuth();
  const panelEnabled = usePanelQueriesEnabled();
  const isDoctor = user?.role === "doctor";
  const isAdmin = user?.role === "admin";
  const doctorId = isDoctor ? undefined : input.doctorId;

  return useQuery({
    queryKey: scheduleBlocksQueryKey({
      from: input.from,
      to: input.to,
      doctorId: doctorId ?? (isDoctor ? user?.id : undefined),
    }),
    enabled: panelEnabled && (input.enabled ?? true) && (isDoctor || isAdmin),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    queryFn: () =>
      fetchScheduleBlocks({
        from: input.from,
        to: input.to,
        doctorId,
      }),
  });
}
