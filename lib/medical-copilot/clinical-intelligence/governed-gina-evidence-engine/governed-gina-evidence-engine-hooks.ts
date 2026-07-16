"use client";
import { useCallback, useEffect, useState } from "react";
import { governedGinaEvidenceEngineReadAdapter, type GovernedGinaEvidenceEngineReadAdapter } from "./governed-gina-evidence-engine-adapter";
import type { GovernedGinaEvidenceEngineResult } from "./governed-gina-evidence-engine";
export type UseGovernedGinaEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedGinaEvidenceEngineReadAdapter };
export type UseGovernedGinaEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedGinaEvidenceEngineResult | null; refresh: () => void };
export function useGovernedGinaEvidenceEngine(options: UseGovernedGinaEvidenceEngineOptions): UseGovernedGinaEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedGinaEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedGinaEvidenceEngineResult | null>(null);
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
