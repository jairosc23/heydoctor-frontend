"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalConsultationWorkflowReadAdapter, type GovernedClinicalConsultationWorkflowReadAdapter } from "./governed-clinical-consultation-workflow-adapter";
import type { GovernedClinicalConsultationWorkflowResult } from "./governed-clinical-consultation-workflow";
export type UseGovernedClinicalConsultationWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalConsultationWorkflowReadAdapter };
export type UseGovernedClinicalConsultationWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalConsultationWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalConsultationWorkflow(options: UseGovernedClinicalConsultationWorkflowOptions): UseGovernedClinicalConsultationWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalConsultationWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalConsultationWorkflowResult | null>(null);
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
