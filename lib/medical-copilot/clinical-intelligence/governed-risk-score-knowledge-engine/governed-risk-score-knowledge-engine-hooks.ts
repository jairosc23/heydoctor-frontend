"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedRiskScoreKnowledgeEngineReadAdapter, type GovernedRiskScoreKnowledgeEngineReadAdapter } from "./governed-risk-score-knowledge-engine-adapter";
import type { GovernedRiskScoreKnowledgeEngineResult } from "./governed-risk-score-knowledge-engine";
export type UseGovernedRiskScoreKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRiskScoreKnowledgeEngineReadAdapter };
export type UseGovernedRiskScoreKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedRiskScoreKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedRiskScoreKnowledgeEngine(options: UseGovernedRiskScoreKnowledgeEngineOptions): UseGovernedRiskScoreKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedRiskScoreKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRiskScoreKnowledgeEngineResult | null>(null);
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
