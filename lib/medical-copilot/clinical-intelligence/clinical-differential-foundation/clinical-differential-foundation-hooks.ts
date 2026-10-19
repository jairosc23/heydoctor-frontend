"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { differentialReadAdapter, type ClinicalDifferentialFoundationReadAdapter } from "./clinical-differential-foundation-adapter";
import type { ClinicalDifferentialFoundationBuilderResult } from "./clinical-differential-foundation";

export type UseClinicalDifferentialFoundationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalDifferentialFoundationReadAdapter;
};
export type UseClinicalDifferentialFoundationResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalDifferentialFoundationBuilderResult | null;
  refresh: () => void;
};

export function useClinicalDifferentialFoundation(options: UseClinicalDifferentialFoundationOptions): UseClinicalDifferentialFoundationResult {
  const { sessionId, enabled = true, adapter = differentialReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalDifferentialFoundationBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalDifferentialFoundation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
