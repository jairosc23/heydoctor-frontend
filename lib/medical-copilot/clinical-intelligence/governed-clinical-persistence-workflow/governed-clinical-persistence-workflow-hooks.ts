"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalPersistenceWorkflowReadAdapter, type GovernedClinicalPersistenceWorkflowReadAdapter } from "./governed-clinical-persistence-workflow-adapter";
import type { GovernedClinicalPersistenceWorkflowResult } from "./governed-clinical-persistence-workflow";
export type UseGovernedClinicalPersistenceWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalPersistenceWorkflowReadAdapter };
export type UseGovernedClinicalPersistenceWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalPersistenceWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalPersistenceWorkflow(options: UseGovernedClinicalPersistenceWorkflowOptions): UseGovernedClinicalPersistenceWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalPersistenceWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalPersistenceWorkflowResult | null>(null);
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
