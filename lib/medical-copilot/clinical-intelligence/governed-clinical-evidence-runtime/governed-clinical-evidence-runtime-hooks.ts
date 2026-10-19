"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalEvidenceRuntimeReadAdapter, type GovernedClinicalEvidenceRuntimeReadAdapter } from "./governed-clinical-evidence-runtime-adapter";
import type { GovernedClinicalEvidenceRuntimeResult } from "./governed-clinical-evidence-runtime";

export type UseGovernedClinicalEvidenceRuntimeOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalEvidenceRuntimeReadAdapter };
export type UseGovernedClinicalEvidenceRuntimeResult = { loading: boolean; error: string | null; result: GovernedClinicalEvidenceRuntimeResult | null; refresh: () => void };

export function useGovernedClinicalEvidenceRuntime(options: UseGovernedClinicalEvidenceRuntimeOptions): UseGovernedClinicalEvidenceRuntimeResult {
  const { sessionId, enabled = true, adapter = governedClinicalEvidenceRuntimeReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalEvidenceRuntimeResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalEvidenceRuntime(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
