"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedLifestyleMedicineKnowledgeEngineReadAdapter, type GovernedLifestyleMedicineKnowledgeEngineReadAdapter } from "./governed-lifestyle-medicine-knowledge-engine-adapter";
import type { GovernedLifestyleMedicineKnowledgeEngineResult } from "./governed-lifestyle-medicine-knowledge-engine";
export type UseGovernedLifestyleMedicineKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedLifestyleMedicineKnowledgeEngineReadAdapter };
export type UseGovernedLifestyleMedicineKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedLifestyleMedicineKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedLifestyleMedicineKnowledgeEngine(options: UseGovernedLifestyleMedicineKnowledgeEngineOptions): UseGovernedLifestyleMedicineKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedLifestyleMedicineKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedLifestyleMedicineKnowledgeEngineResult | null>(null);
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
