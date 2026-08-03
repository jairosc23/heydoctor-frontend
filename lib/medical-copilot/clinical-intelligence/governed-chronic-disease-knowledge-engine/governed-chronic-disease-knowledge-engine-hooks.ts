"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedChronicDiseaseKnowledgeEngineReadAdapter, type GovernedChronicDiseaseKnowledgeEngineReadAdapter } from "./governed-chronic-disease-knowledge-engine-adapter";
import type { GovernedChronicDiseaseKnowledgeEngineResult } from "./governed-chronic-disease-knowledge-engine";
export type UseGovernedChronicDiseaseKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedChronicDiseaseKnowledgeEngineReadAdapter };
export type UseGovernedChronicDiseaseKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedChronicDiseaseKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedChronicDiseaseKnowledgeEngine(options: UseGovernedChronicDiseaseKnowledgeEngineOptions): UseGovernedChronicDiseaseKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedChronicDiseaseKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedChronicDiseaseKnowledgeEngineResult | null>(null);
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
