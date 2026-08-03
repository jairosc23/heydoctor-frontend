"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedProcedureKnowledgeEngineReadAdapter, type GovernedProcedureKnowledgeEngineReadAdapter } from "./governed-procedure-knowledge-engine-adapter";
import type { GovernedProcedureKnowledgeEngineResult } from "./governed-procedure-knowledge-engine";
export type UseGovernedProcedureKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedProcedureKnowledgeEngineReadAdapter };
export type UseGovernedProcedureKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedProcedureKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedProcedureKnowledgeEngine(options: UseGovernedProcedureKnowledgeEngineOptions): UseGovernedProcedureKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedProcedureKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedProcedureKnowledgeEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
