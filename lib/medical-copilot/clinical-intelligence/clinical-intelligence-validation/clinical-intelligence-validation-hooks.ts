"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { clinicalIntelligenceValidationReadAdapter, type ClinicalIntelligenceValidationReadAdapter } from "./clinical-intelligence-validation-adapter";
import type { ClinicalIntelligenceValidationBuilderResult } from "./clinical-intelligence-validation";
export type UseClinicalIntelligenceValidationOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalIntelligenceValidationReadAdapter; };
export type UseClinicalIntelligenceValidationResult = { loading: boolean; error: string | null; result: ClinicalIntelligenceValidationBuilderResult | null; refresh: () => void; };
export function useClinicalIntelligenceValidation(options: UseClinicalIntelligenceValidationOptions): UseClinicalIntelligenceValidationResult {
  const { sessionId, enabled = true, adapter = clinicalIntelligenceValidationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalIntelligenceValidationBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalIntelligenceValidation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
