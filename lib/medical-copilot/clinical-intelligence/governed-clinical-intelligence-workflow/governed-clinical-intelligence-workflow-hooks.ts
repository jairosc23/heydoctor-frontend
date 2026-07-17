"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalIntelligenceWorkflowReadAdapter, type GovernedClinicalIntelligenceWorkflowReadAdapter } from "./governed-clinical-intelligence-workflow-adapter";
import type { GovernedClinicalIntelligenceWorkflowResult } from "./governed-clinical-intelligence-workflow";
export type UseGovernedClinicalIntelligenceWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalIntelligenceWorkflowReadAdapter };
export type UseGovernedClinicalIntelligenceWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalIntelligenceWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalIntelligenceWorkflow(options: UseGovernedClinicalIntelligenceWorkflowOptions): UseGovernedClinicalIntelligenceWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalIntelligenceWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalIntelligenceWorkflowResult | null>(null);
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
