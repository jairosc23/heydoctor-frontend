"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedUspstfEvidenceEngineReadAdapter, type GovernedUspstfEvidenceEngineReadAdapter } from "./governed-uspstf-evidence-engine-adapter";
import type { GovernedUspstfEvidenceEngineResult } from "./governed-uspstf-evidence-engine";
export type UseGovernedUspstfEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedUspstfEvidenceEngineReadAdapter };
export type UseGovernedUspstfEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedUspstfEvidenceEngineResult | null; refresh: () => void };
export function useGovernedUspstfEvidenceEngine(options: UseGovernedUspstfEvidenceEngineOptions): UseGovernedUspstfEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedUspstfEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedUspstfEvidenceEngineResult | null>(null);
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
