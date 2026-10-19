"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedFollowUpKnowledgeEngineReadAdapter, type GovernedFollowUpKnowledgeEngineReadAdapter } from "./governed-follow-up-knowledge-engine-adapter";
import type { GovernedFollowUpKnowledgeEngineResult } from "./governed-follow-up-knowledge-engine";
export type UseGovernedFollowUpKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedFollowUpKnowledgeEngineReadAdapter };
export type UseGovernedFollowUpKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedFollowUpKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedFollowUpKnowledgeEngine(options: UseGovernedFollowUpKnowledgeEngineOptions): UseGovernedFollowUpKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedFollowUpKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedFollowUpKnowledgeEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
