"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedCdcEvidenceEngineReadAdapter, type GovernedCdcEvidenceEngineReadAdapter } from "./governed-cdc-evidence-engine-adapter";
import type { GovernedCdcEvidenceEngineResult } from "./governed-cdc-evidence-engine";
export type UseGovernedCdcEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCdcEvidenceEngineReadAdapter };
export type UseGovernedCdcEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedCdcEvidenceEngineResult | null; refresh: () => void };
export function useGovernedCdcEvidenceEngine(options: UseGovernedCdcEvidenceEngineOptions): UseGovernedCdcEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedCdcEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCdcEvidenceEngineResult | null>(null);
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
