"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalDashboardWorkflowReadAdapter, type GovernedClinicalDashboardWorkflowReadAdapter } from "./governed-clinical-dashboard-workflow-adapter";
import type { GovernedClinicalDashboardWorkflowResult } from "./governed-clinical-dashboard-workflow";
export type UseGovernedClinicalDashboardWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalDashboardWorkflowReadAdapter };
export type UseGovernedClinicalDashboardWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalDashboardWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalDashboardWorkflow(options: UseGovernedClinicalDashboardWorkflowOptions): UseGovernedClinicalDashboardWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalDashboardWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalDashboardWorkflowResult | null>(null);
  const refresh = useCallback(() => {
    if (!sessionId || !enabled) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    adapter.get(sessionId).then((mapped) => { if (!cancelled) { setResult(mapped); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e instanceof Error ? e.message : "Error"); setLoading(false); } });
    return () => { cancelled = true; };
  }, [sessionId, enabled, adapter]);
  useEffect(() => { const cancel = refresh(); return typeof cancel === "function" ? cancel : undefined; }, [refresh]);
  return { loading, error, result, refresh: () => { refresh(); } };
}
