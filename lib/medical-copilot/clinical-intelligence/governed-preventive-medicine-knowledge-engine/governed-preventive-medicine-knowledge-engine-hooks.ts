"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPreventiveMedicineKnowledgeEngineReadAdapter, type GovernedPreventiveMedicineKnowledgeEngineReadAdapter } from "./governed-preventive-medicine-knowledge-engine-adapter";
import type { GovernedPreventiveMedicineKnowledgeEngineResult } from "./governed-preventive-medicine-knowledge-engine";
export type UseGovernedPreventiveMedicineKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPreventiveMedicineKnowledgeEngineReadAdapter };
export type UseGovernedPreventiveMedicineKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedPreventiveMedicineKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedPreventiveMedicineKnowledgeEngine(options: UseGovernedPreventiveMedicineKnowledgeEngineOptions): UseGovernedPreventiveMedicineKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedPreventiveMedicineKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPreventiveMedicineKnowledgeEngineResult | null>(null);
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
