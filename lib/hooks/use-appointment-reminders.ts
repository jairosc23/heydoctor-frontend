"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { usePanelQueriesEnabled } from "@/lib/hooks/use-panel-list-queries";
import {
  fetchReminderPolicies,
  fetchReminders,
} from "@/lib/services/appointments";

export function reminderPoliciesQueryKey(doctorId?: string) {
  return ["appointments", "reminder-policies", doctorId ?? "clinic"] as const;
}

export function remindersQueryKey(input: {
  from: string;
  to: string;
  doctorId?: string;
}) {
  return [
    "appointments",
    "reminders",
    input.from,
    input.to,
    input.doctorId ?? "clinic",
  ] as const;
}

export function useReminderPoliciesQuery(input: {
  doctorId?: string;
  enabled?: boolean;
}) {
  const { user } = useAuth();
  const panelEnabled = usePanelQueriesEnabled();
  const isDoctor = user?.role === "doctor";
  const isAdmin = user?.role === "admin";
  const doctorId = isDoctor ? undefined : input.doctorId;

  return useQuery({
    queryKey: reminderPoliciesQueryKey(
      doctorId ?? (isDoctor ? user?.id : undefined),
    ),
    enabled: panelEnabled && (input.enabled ?? true) && (isDoctor || isAdmin),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    queryFn: () => fetchReminderPolicies(doctorId),
  });
}

export function useRemindersQuery(input: {
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
    queryKey: remindersQueryKey({
      from: input.from,
      to: input.to,
      doctorId: doctorId ?? (isDoctor ? user?.id : undefined),
    }),
    enabled: panelEnabled && (input.enabled ?? true) && (isDoctor || isAdmin),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
    queryFn: () =>
      fetchReminders({
        from: input.from,
        to: input.to,
        doctorId,
      }),
  });
}
