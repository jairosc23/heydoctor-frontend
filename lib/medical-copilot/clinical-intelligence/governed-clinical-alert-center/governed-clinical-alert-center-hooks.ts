"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalAlertCenterReadAdapter, type GovernedClinicalAlertCenterReadAdapter } from "./governed-clinical-alert-center-adapter";
import type { GovernedClinicalAlertCenterResult } from "./governed-clinical-alert-center";

export type UseGovernedClinicalAlertCenterOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalAlertCenterReadAdapter };
export type UseGovernedClinicalAlertCenterResult = { loading: boolean; error: string | null; result: GovernedClinicalAlertCenterResult | null; refresh: () => void };

export function useGovernedClinicalAlertCenter(options: UseGovernedClinicalAlertCenterOptions): UseGovernedClinicalAlertCenterResult {
  const { sessionId, enabled = true, adapter = governedClinicalAlertCenterReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalAlertCenterResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalAlertCenter(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
