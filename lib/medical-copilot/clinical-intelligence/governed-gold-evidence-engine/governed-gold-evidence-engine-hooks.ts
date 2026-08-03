"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedGoldEvidenceEngineReadAdapter, type GovernedGoldEvidenceEngineReadAdapter } from "./governed-gold-evidence-engine-adapter";
import type { GovernedGoldEvidenceEngineResult } from "./governed-gold-evidence-engine";
export type UseGovernedGoldEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedGoldEvidenceEngineReadAdapter };
export type UseGovernedGoldEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedGoldEvidenceEngineResult | null; refresh: () => void };
export function useGovernedGoldEvidenceEngine(options: UseGovernedGoldEvidenceEngineOptions): UseGovernedGoldEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedGoldEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedGoldEvidenceEngineResult | null>(null);
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
