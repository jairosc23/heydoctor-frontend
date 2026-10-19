"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { resolveClinicTimezone } from "@/lib/agenda/calendar-utils";
import { useAuth } from "@/lib/context/AuthContext";
import { usePanelQueriesEnabled } from "@/lib/hooks/use-panel-list-queries";
import { fetchClinicProfile } from "@/lib/services/clinic";
import { fetchMyDoctorProfile } from "@/lib/services/my-doctor-profile";

export function clinicProfileQueryKey(clinicId?: string) {
  return ["clinic", "me", clinicId ?? "none"] as const;
}

export function doctorTimezoneQueryKey(userId?: string) {
  return ["doctor-profile", "timezone", userId ?? "none"] as const;
}

export function useClinicProfileQuery(enabled = true) {
  const { user } = useAuth();
  const panelEnabled = usePanelQueriesEnabled();

  return useQuery({
    queryKey: clinicProfileQueryKey(user?.clinicId),
    enabled: panelEnabled && enabled && Boolean(user?.clinicId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    queryFn: fetchClinicProfile,
  });
}

export function useDoctorTimezoneQuery(enabled = true) {
  const { user } = useAuth();
  const panelEnabled = usePanelQueriesEnabled();
  const canQuery =
    user?.role === "doctor" || user?.role === "admin";

  return useQuery({
    queryKey: doctorTimezoneQueryKey(user?.id),
    enabled: panelEnabled && enabled && canQuery,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await fetchMyDoctorProfile();
      return res.profile?.timezone ?? null;
    },
  });
}

/** Effective clinic IANA for agenda (SSOT → auth.me → browser fallback). */
export function useResolvedClinicTimezone(): {
  timeZone: string;
  clinicName?: string;
  isLoading: boolean;
  isError: boolean;
  source: "ssot" | "auth" | "browser";
} {
  const { user } = useAuth();
  const clinicQuery = useClinicProfileQuery();
  const ssot = clinicQuery.data?.timezone;
  const authTz = user?.clinicTimezone;
  const timeZone = resolveClinicTimezone(ssot ?? authTz);
  const source: "ssot" | "auth" | "browser" = ssot
    ? "ssot"
    : authTz
      ? "auth"
      : "browser";

  return {
    timeZone,
    clinicName: clinicQuery.data?.name,
    isLoading: clinicQuery.isLoading,
    isError: clinicQuery.isError,
    source,
  };
}
