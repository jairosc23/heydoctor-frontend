"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { reasoningValidationEngineReadAdapter, type ReasoningValidationEngineReadAdapter } from "./reasoning-validation-engine-adapter";
import type { ReasoningValidationEngineBuilderResult } from "./reasoning-validation-engine";
export type UseReasoningValidationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ReasoningValidationEngineReadAdapter; };
export type UseReasoningValidationEngineResult = { loading: boolean; error: string | null; result: ReasoningValidationEngineBuilderResult | null; refresh: () => void; };
export function useReasoningValidationEngine(options: UseReasoningValidationEngineOptions): UseReasoningValidationEngineResult {
  const { sessionId, enabled = true, adapter = reasoningValidationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReasoningValidationEngineBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getReasoningValidationEngine(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
