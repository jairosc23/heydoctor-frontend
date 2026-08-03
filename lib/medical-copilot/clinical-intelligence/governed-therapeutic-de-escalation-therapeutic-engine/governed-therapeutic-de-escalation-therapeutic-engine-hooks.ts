"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedTherapeuticDeEscalationTherapeuticEngineReadAdapter, type GovernedTherapeuticDeEscalationTherapeuticEngineReadAdapter } from "./governed-therapeutic-de-escalation-therapeutic-engine-adapter";
import type { GovernedTherapeuticDeEscalationTherapeuticEngineResult } from "./governed-therapeutic-de-escalation-therapeutic-engine";
export type UseGovernedTherapeuticDeEscalationTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedTherapeuticDeEscalationTherapeuticEngineReadAdapter };
export type UseGovernedTherapeuticDeEscalationTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedTherapeuticDeEscalationTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedTherapeuticDeEscalationTherapeuticEngine(options: UseGovernedTherapeuticDeEscalationTherapeuticEngineOptions): UseGovernedTherapeuticDeEscalationTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedTherapeuticDeEscalationTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedTherapeuticDeEscalationTherapeuticEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
