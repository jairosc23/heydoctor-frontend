"use client";

import { useMemo } from "react";
import {
  useConsultationsListQuery,
  usePanelQueriesEnabled,
  usePatientsListQuery,
} from "@/lib/hooks/use-panel-list-queries";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useDashboardStats() {
  const enabled = usePanelQueriesEnabled();
  const today = useMemo(() => todayIsoDate(), []);

  const patientsQuery = usePatientsListQuery({ limit: 1 }, { enabled });
  const consultationsTodayQuery = useConsultationsListQuery(
    { from: today, to: today, limit: 1 },
    { enabled },
  );
  const pendingConsultationsQuery = useConsultationsListQuery(
    { status: "IN_PROGRESS", limit: 1 },
    { enabled },
  );

  const isLoading =
    enabled &&
    (patientsQuery.isPending ||
      consultationsTodayQuery.isPending ||
      pendingConsultationsQuery.isPending);

  const isError =
    patientsQuery.isError ||
    consultationsTodayQuery.isError ||
    pendingConsultationsQuery.isError;

  const error =
    patientsQuery.error ??
    consultationsTodayQuery.error ??
    pendingConsultationsQuery.error;

  const stats = enabled
    ? {
        totalPatients: patientsQuery.data?.total ?? 0,
        consultationsToday: consultationsTodayQuery.data?.total ?? 0,
        pendingConsultations: pendingConsultationsQuery.data?.total ?? 0,
      }
    : null;

  return {
    stats,
    isLoading,
    isError,
    error,
  };
}
