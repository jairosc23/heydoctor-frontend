"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedWomensHealthKnowledgeEngineReadAdapter, type GovernedWomensHealthKnowledgeEngineReadAdapter } from "./governed-womens-health-knowledge-engine-adapter";
import type { GovernedWomensHealthKnowledgeEngineResult } from "./governed-womens-health-knowledge-engine";
export type UseGovernedWomensHealthKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedWomensHealthKnowledgeEngineReadAdapter };
export type UseGovernedWomensHealthKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedWomensHealthKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedWomensHealthKnowledgeEngine(options: UseGovernedWomensHealthKnowledgeEngineOptions): UseGovernedWomensHealthKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedWomensHealthKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedWomensHealthKnowledgeEngineResult | null>(null);
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
