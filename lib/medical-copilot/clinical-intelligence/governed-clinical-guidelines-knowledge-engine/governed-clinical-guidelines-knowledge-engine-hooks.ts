"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalGuidelinesKnowledgeEngineReadAdapter, type GovernedClinicalGuidelinesKnowledgeEngineReadAdapter } from "./governed-clinical-guidelines-knowledge-engine-adapter";
import type { GovernedClinicalGuidelinesKnowledgeEngineResult } from "./governed-clinical-guidelines-knowledge-engine";
export type UseGovernedClinicalGuidelinesKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalGuidelinesKnowledgeEngineReadAdapter };
export type UseGovernedClinicalGuidelinesKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalGuidelinesKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedClinicalGuidelinesKnowledgeEngine(options: UseGovernedClinicalGuidelinesKnowledgeEngineOptions): UseGovernedClinicalGuidelinesKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalGuidelinesKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalGuidelinesKnowledgeEngineResult | null>(null);
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
