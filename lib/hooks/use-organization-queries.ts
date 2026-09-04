"use client";

import { useQuery } from "@tanstack/react-query";
import {
  myOrganizationsQueryKey,
  organizationDashboardQueryKey,
} from "@/lib/queries/query-keys";
import {
  fetchMyOrganizations,
  fetchOrganizationDashboard,
} from "@/lib/services/organizations";

const ORG_QUERY_OPTIONS = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export function useMyOrganizationsQuery() {
  return useQuery({
    queryKey: myOrganizationsQueryKey(),
    queryFn: fetchMyOrganizations,
    ...ORG_QUERY_OPTIONS,
  });
}

export function useOrganizationDashboardQuery(organizationId: string) {
  return useQuery({
    queryKey: organizationDashboardQueryKey(organizationId),
    queryFn: () => fetchOrganizationDashboard(organizationId),
    enabled: organizationId.length > 0,
    ...ORG_QUERY_OPTIONS,
  });
}
