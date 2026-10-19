"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalAuditWorkflowReadAdapter, type GovernedClinicalAuditWorkflowReadAdapter } from "./governed-clinical-audit-workflow-adapter";
import type { GovernedClinicalAuditWorkflowResult } from "./governed-clinical-audit-workflow";
export type UseGovernedClinicalAuditWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalAuditWorkflowReadAdapter };
export type UseGovernedClinicalAuditWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalAuditWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalAuditWorkflow(options: UseGovernedClinicalAuditWorkflowOptions): UseGovernedClinicalAuditWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalAuditWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalAuditWorkflowResult | null>(null);
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
