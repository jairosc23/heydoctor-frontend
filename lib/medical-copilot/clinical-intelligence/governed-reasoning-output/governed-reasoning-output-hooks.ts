"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedReasoningOutputReadAdapter, type GovernedReasoningOutputReadAdapter } from "./governed-reasoning-output-adapter";
import type { GovernedReasoningOutputBuilderResult } from "./governed-reasoning-output";
export type UseGovernedReasoningOutputOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedReasoningOutputReadAdapter; };
export type UseGovernedReasoningOutputResult = { loading: boolean; error: string | null; result: GovernedReasoningOutputBuilderResult | null; refresh: () => void; };
export function useGovernedReasoningOutput(options: UseGovernedReasoningOutputOptions): UseGovernedReasoningOutputResult {
  const { sessionId, enabled = true, adapter = governedReasoningOutputReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReasoningOutputBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedReasoningOutput(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
