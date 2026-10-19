"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedMedicationKnowledgeEngineReadAdapter, type GovernedMedicationKnowledgeEngineReadAdapter } from "./governed-medication-knowledge-engine-adapter";
import type { GovernedMedicationKnowledgeEngineResult } from "./governed-medication-knowledge-engine";
export type UseGovernedMedicationKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMedicationKnowledgeEngineReadAdapter };
export type UseGovernedMedicationKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedMedicationKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedMedicationKnowledgeEngine(options: UseGovernedMedicationKnowledgeEngineOptions): UseGovernedMedicationKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedMedicationKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMedicationKnowledgeEngineResult | null>(null);
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
