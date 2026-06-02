"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  appointmentsListQueryKey,
  consultationsListQueryKey,
  patientsListQueryKey,
} from "@/lib/queries/query-keys";
import {
  fetchAppointments,
  type AppointmentFilters,
} from "@/lib/services/appointments";
import {
  fetchConsultations,
  type ConsultationFilters,
} from "@/lib/services/consultations";
import { fetchPatients, type PatientFilters } from "@/lib/services/patients";

const LIST_QUERY_OPTIONS = {
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  placeholderData: keepPreviousData,
} as const;

/** Espera hidratación auth antes de listados del panel (no altera bootstrap SSR). */
export function usePanelQueriesEnabled(): boolean {
  const { loading, user } = useAuth();
  return !loading && !!user;
}

export function usePatientsListQuery(
  filters?: PatientFilters,
  options?: { enabled?: boolean },
) {
  const panelEnabled = usePanelQueriesEnabled();
  const enabled = (options?.enabled ?? true) && panelEnabled;

  return useQuery({
    queryKey: patientsListQueryKey(filters),
    queryFn: () => fetchPatients(filters),
    enabled,
    ...LIST_QUERY_OPTIONS,
  });
}

export function useConsultationsListQuery(
  filters?: ConsultationFilters,
  options?: { enabled?: boolean },
) {
  const panelEnabled = usePanelQueriesEnabled();
  const enabled = (options?.enabled ?? true) && panelEnabled;

  return useQuery({
    queryKey: consultationsListQueryKey(filters),
    queryFn: () => fetchConsultations(filters),
    enabled,
    ...LIST_QUERY_OPTIONS,
  });
}

export function useAppointmentsListQuery(
  filters?: AppointmentFilters,
  options?: { enabled?: boolean },
) {
  const panelEnabled = usePanelQueriesEnabled();
  const enabled = (options?.enabled ?? true) && panelEnabled;

  return useQuery({
    queryKey: appointmentsListQueryKey(filters),
    queryFn: () => fetchAppointments(filters),
    enabled,
    ...LIST_QUERY_OPTIONS,
  });
}
