"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import { usePanelQueriesEnabled } from "@/lib/hooks/use-panel-list-queries";
import { heydoctorApi } from "@/lib/heydoctor-api";

export type ClinicDoctorOption = { id: string; label: string };
type ClinicDoctor = { id: string; name: string | null; role: "doctor" };

export async function fetchClinicDoctorOptions(): Promise<ClinicDoctorOption[]> {
  // Authenticated, clinic-scoped backend directory. Never fall back to public
  // profiles or appointment-derived doctors when authorization fails.
  const doctors = await heydoctorApi.get<ClinicDoctor[]>("/users/clinic/doctors");
  if (!Array.isArray(doctors)) throw new Error("Directorio médico inválido");
  return doctors.map((doctor) => ({
    id: doctor.id,
    label: doctor.name?.trim() || `Médico ${doctor.id.slice(0, 8)}`,
  }));
}

export function useClinicDoctorOptions() {
  const { user } = useAuth();
  const enabled = usePanelQueriesEnabled();
  return useQuery({
    queryKey: ["clinic", "doctors", user?.clinicId, user?.id],
    queryFn: fetchClinicDoctorOptions,
    enabled: enabled && user?.role === "admin" && !!user.clinicId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}
