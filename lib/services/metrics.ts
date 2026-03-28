import { apiGet } from "../api-client";

export interface RollingMetrics {
  upgrades7d: number;
  upgrades30d: number;
  sales30d: number;
  support30d: number;
  conversionRate: number;
}

export async function fetchRollingMetrics(): Promise<RollingMetrics> {
  return apiGet<RollingMetrics>("/metrics/rolling");
}
