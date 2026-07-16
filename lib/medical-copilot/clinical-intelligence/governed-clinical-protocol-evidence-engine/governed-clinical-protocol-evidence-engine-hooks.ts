"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalProtocolEvidenceEngineReadAdapter, type GovernedClinicalProtocolEvidenceEngineReadAdapter } from "./governed-clinical-protocol-evidence-engine-adapter";
import type { GovernedClinicalProtocolEvidenceEngineResult } from "./governed-clinical-protocol-evidence-engine";
export type UseGovernedClinicalProtocolEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalProtocolEvidenceEngineReadAdapter };
export type UseGovernedClinicalProtocolEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalProtocolEvidenceEngineResult | null; refresh: () => void };
export function useGovernedClinicalProtocolEvidenceEngine(options: UseGovernedClinicalProtocolEvidenceEngineOptions): UseGovernedClinicalProtocolEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalProtocolEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalProtocolEvidenceEngineResult | null>(null);
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
