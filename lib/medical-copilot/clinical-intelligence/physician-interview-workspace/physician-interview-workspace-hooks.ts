"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { interviewWorkspaceReadAdapter, type PhysicianInterviewWorkspaceReadAdapter } from "./physician-interview-workspace-adapter";
import type { PhysicianInterviewWorkspaceBuilderResult } from "./physician-interview-workspace";

export type UsePhysicianInterviewWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: PhysicianInterviewWorkspaceReadAdapter;
};
export type UsePhysicianInterviewWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: PhysicianInterviewWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function usePhysicianInterviewWorkspace(options: UsePhysicianInterviewWorkspaceOptions): UsePhysicianInterviewWorkspaceResult {
  const { sessionId, enabled = true, adapter = interviewWorkspaceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhysicianInterviewWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getPhysicianInterviewWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
