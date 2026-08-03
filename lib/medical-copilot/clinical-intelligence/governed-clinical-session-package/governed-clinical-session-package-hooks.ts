"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { sessionPackageReadAdapter, type GovernedClinicalSessionPackageReadAdapter } from "./governed-clinical-session-package-adapter";
import type { GovernedClinicalSessionPackageBuilderResult } from "./governed-clinical-session-package";

export type UseGovernedClinicalSessionPackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalSessionPackageReadAdapter;
};
export type UseGovernedClinicalSessionPackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalSessionPackageBuilderResult | null;
  refresh: () => void;
};

export function useGovernedClinicalSessionPackage(options: UseGovernedClinicalSessionPackageOptions): UseGovernedClinicalSessionPackageResult {
  const { sessionId, enabled = true, adapter = sessionPackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalSessionPackageBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalSessionPackage(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
