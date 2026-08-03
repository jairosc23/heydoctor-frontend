"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedMentalHealthKnowledgeEngineReadAdapter, type GovernedMentalHealthKnowledgeEngineReadAdapter } from "./governed-mental-health-knowledge-engine-adapter";
import type { GovernedMentalHealthKnowledgeEngineResult } from "./governed-mental-health-knowledge-engine";
export type UseGovernedMentalHealthKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMentalHealthKnowledgeEngineReadAdapter };
export type UseGovernedMentalHealthKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedMentalHealthKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedMentalHealthKnowledgeEngine(options: UseGovernedMentalHealthKnowledgeEngineOptions): UseGovernedMentalHealthKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedMentalHealthKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMentalHealthKnowledgeEngineResult | null>(null);
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
