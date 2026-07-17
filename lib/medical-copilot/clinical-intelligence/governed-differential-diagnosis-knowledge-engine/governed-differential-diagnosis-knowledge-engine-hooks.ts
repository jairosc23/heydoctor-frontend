"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDifferentialDiagnosisKnowledgeEngineReadAdapter, type GovernedDifferentialDiagnosisKnowledgeEngineReadAdapter } from "./governed-differential-diagnosis-knowledge-engine-adapter";
import type { GovernedDifferentialDiagnosisKnowledgeEngineResult } from "./governed-differential-diagnosis-knowledge-engine";
export type UseGovernedDifferentialDiagnosisKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDifferentialDiagnosisKnowledgeEngineReadAdapter };
export type UseGovernedDifferentialDiagnosisKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedDifferentialDiagnosisKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedDifferentialDiagnosisKnowledgeEngine(options: UseGovernedDifferentialDiagnosisKnowledgeEngineOptions): UseGovernedDifferentialDiagnosisKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedDifferentialDiagnosisKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDifferentialDiagnosisKnowledgeEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
