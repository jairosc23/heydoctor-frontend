"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalAnalyticsWorkflowReadAdapter, type GovernedClinicalAnalyticsWorkflowReadAdapter } from "./governed-clinical-analytics-workflow-adapter";
import type { GovernedClinicalAnalyticsWorkflowResult } from "./governed-clinical-analytics-workflow";
export type UseGovernedClinicalAnalyticsWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalAnalyticsWorkflowReadAdapter };
export type UseGovernedClinicalAnalyticsWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalAnalyticsWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalAnalyticsWorkflow(options: UseGovernedClinicalAnalyticsWorkflowOptions): UseGovernedClinicalAnalyticsWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalAnalyticsWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalAnalyticsWorkflowResult | null>(null);
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
