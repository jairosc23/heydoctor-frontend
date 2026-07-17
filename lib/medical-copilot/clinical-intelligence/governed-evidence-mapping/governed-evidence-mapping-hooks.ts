"use client";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceMappingReadAdapter, type GovernedEvidenceMappingReadAdapter } from "./governed-evidence-mapping-adapter";
import type { GovernedEvidenceMappingResult } from "./governed-evidence-mapping";

export type UseGovernedEvidenceMappingOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceMappingReadAdapter };
export type UseGovernedEvidenceMappingResult = { loading: boolean; error: string | null; result: GovernedEvidenceMappingResult | null; refresh: () => void };

export function useGovernedEvidenceMapping(options: UseGovernedEvidenceMappingOptions): UseGovernedEvidenceMappingResult {
  const { sessionId, enabled = true, adapter = governedEvidenceMappingReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceMappingResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedEvidenceMapping(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
