"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { decisionWorkspaceReadAdapter, type PhysicianDecisionWorkspaceReadAdapter } from "./physician-decision-workspace-adapter";
import type { PhysicianDecisionWorkspaceBuilderResult } from "./physician-decision-workspace";

export type UsePhysicianDecisionWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: PhysicianDecisionWorkspaceReadAdapter;
};
export type UsePhysicianDecisionWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: PhysicianDecisionWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function usePhysicianDecisionWorkspace(options: UsePhysicianDecisionWorkspaceOptions): UsePhysicianDecisionWorkspaceResult {
  const { sessionId, enabled = true, adapter = decisionWorkspaceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhysicianDecisionWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getPhysicianDecisionWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
