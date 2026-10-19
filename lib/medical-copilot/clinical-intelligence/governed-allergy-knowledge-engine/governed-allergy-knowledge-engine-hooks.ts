"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedAllergyKnowledgeEngineReadAdapter, type GovernedAllergyKnowledgeEngineReadAdapter } from "./governed-allergy-knowledge-engine-adapter";
import type { GovernedAllergyKnowledgeEngineResult } from "./governed-allergy-knowledge-engine";
export type UseGovernedAllergyKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAllergyKnowledgeEngineReadAdapter };
export type UseGovernedAllergyKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedAllergyKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedAllergyKnowledgeEngine(options: UseGovernedAllergyKnowledgeEngineOptions): UseGovernedAllergyKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedAllergyKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAllergyKnowledgeEngineResult | null>(null);
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
