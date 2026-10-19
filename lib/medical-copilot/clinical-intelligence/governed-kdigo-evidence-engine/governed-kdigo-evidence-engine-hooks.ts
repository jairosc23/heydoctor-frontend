"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedKdigoEvidenceEngineReadAdapter, type GovernedKdigoEvidenceEngineReadAdapter } from "./governed-kdigo-evidence-engine-adapter";
import type { GovernedKdigoEvidenceEngineResult } from "./governed-kdigo-evidence-engine";
export type UseGovernedKdigoEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedKdigoEvidenceEngineReadAdapter };
export type UseGovernedKdigoEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedKdigoEvidenceEngineResult | null; refresh: () => void };
export function useGovernedKdigoEvidenceEngine(options: UseGovernedKdigoEvidenceEngineOptions): UseGovernedKdigoEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedKdigoEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedKdigoEvidenceEngineResult | null>(null);
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
