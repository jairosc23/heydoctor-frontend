"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalKnowledgeWorkflowReadAdapter, type GovernedClinicalKnowledgeWorkflowReadAdapter } from "./governed-clinical-knowledge-workflow-adapter";
import type { GovernedClinicalKnowledgeWorkflowResult } from "./governed-clinical-knowledge-workflow";
export type UseGovernedClinicalKnowledgeWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalKnowledgeWorkflowReadAdapter };
export type UseGovernedClinicalKnowledgeWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalKnowledgeWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalKnowledgeWorkflow(options: UseGovernedClinicalKnowledgeWorkflowOptions): UseGovernedClinicalKnowledgeWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalKnowledgeWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalKnowledgeWorkflowResult | null>(null);
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
