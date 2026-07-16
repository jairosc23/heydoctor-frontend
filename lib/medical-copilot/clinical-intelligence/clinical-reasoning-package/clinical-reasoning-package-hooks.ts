"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningPackageOutputReadAdapter, type ClinicalReasoningPackageReadAdapter } from "./clinical-reasoning-package-adapter";
import type { ClinicalReasoningPackageBuilderResult } from "./clinical-reasoning-package";
export type UseClinicalReasoningPackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalReasoningPackageReadAdapter; };
export type UseClinicalReasoningPackageResult = { loading: boolean; error: string | null; result: ClinicalReasoningPackageBuilderResult | null; refresh: () => void; };
export function useClinicalReasoningPackage(options: UseClinicalReasoningPackageOptions): UseClinicalReasoningPackageResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningPackageOutputReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningPackageBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningPackage(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
