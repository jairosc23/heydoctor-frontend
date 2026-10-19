"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedDiseaseKnowledgeEngineReadAdapter, type GovernedDiseaseKnowledgeEngineReadAdapter } from "./governed-disease-knowledge-engine-adapter";
import type { GovernedDiseaseKnowledgeEngineResult } from "./governed-disease-knowledge-engine";
export type UseGovernedDiseaseKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiseaseKnowledgeEngineReadAdapter };
export type UseGovernedDiseaseKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedDiseaseKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedDiseaseKnowledgeEngine(options: UseGovernedDiseaseKnowledgeEngineOptions): UseGovernedDiseaseKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedDiseaseKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiseaseKnowledgeEngineResult | null>(null);
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
