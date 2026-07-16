"use client";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceQualityEngineReadAdapter, type GovernedEvidenceQualityEngineReadAdapter } from "./governed-evidence-quality-engine-adapter";
import type { GovernedEvidenceQualityEngineResult } from "./governed-evidence-quality-engine";
export type UseGovernedEvidenceQualityEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceQualityEngineReadAdapter };
export type UseGovernedEvidenceQualityEngineResult = { loading: boolean; error: string | null; result: GovernedEvidenceQualityEngineResult | null; refresh: () => void };
export function useGovernedEvidenceQualityEngine(options: UseGovernedEvidenceQualityEngineOptions): UseGovernedEvidenceQualityEngineResult {
  const { sessionId, enabled = true, adapter = governedEvidenceQualityEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceQualityEngineResult | null>(null);
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
