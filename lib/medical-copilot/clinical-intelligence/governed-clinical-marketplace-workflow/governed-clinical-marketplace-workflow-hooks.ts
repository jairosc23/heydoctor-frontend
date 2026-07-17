"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalMarketplaceWorkflowReadAdapter, type GovernedClinicalMarketplaceWorkflowReadAdapter } from "./governed-clinical-marketplace-workflow-adapter";
import type { GovernedClinicalMarketplaceWorkflowResult } from "./governed-clinical-marketplace-workflow";
export type UseGovernedClinicalMarketplaceWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalMarketplaceWorkflowReadAdapter };
export type UseGovernedClinicalMarketplaceWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalMarketplaceWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalMarketplaceWorkflow(options: UseGovernedClinicalMarketplaceWorkflowOptions): UseGovernedClinicalMarketplaceWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalMarketplaceWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalMarketplaceWorkflowResult | null>(null);
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
