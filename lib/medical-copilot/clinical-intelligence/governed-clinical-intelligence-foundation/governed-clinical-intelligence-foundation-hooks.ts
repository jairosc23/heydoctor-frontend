"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalIntelligenceFoundationReadAdapter, type GovernedClinicalIntelligenceFoundationReadAdapter } from "./governed-clinical-intelligence-foundation-adapter";
import type { GovernedClinicalIntelligenceFoundationBuilderResult } from "./governed-clinical-intelligence-foundation";
export type UseGovernedClinicalIntelligenceFoundationOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalIntelligenceFoundationReadAdapter; };
export type UseGovernedClinicalIntelligenceFoundationResult = { loading: boolean; error: string | null; result: GovernedClinicalIntelligenceFoundationBuilderResult | null; refresh: () => void; };
export function useGovernedClinicalIntelligenceFoundation(options: UseGovernedClinicalIntelligenceFoundationOptions): UseGovernedClinicalIntelligenceFoundationResult {
  const { sessionId, enabled = true, adapter = governedClinicalIntelligenceFoundationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalIntelligenceFoundationBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalIntelligenceFoundation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
