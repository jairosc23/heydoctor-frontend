"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationActivationWorkspaceReadAdapter,
  type GovernedConsultationActivationWorkspaceReadAdapter,
} from "./governed-consultation-activation-workspace-adapter";
import type { GovernedConsultationActivationWorkspaceResult } from "./governed-consultation-activation-workspace";

export type UseGovernedConsultationActivationWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationActivationWorkspaceReadAdapter;
};

export type UseGovernedConsultationActivationWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationActivationWorkspaceResult | null;
  refresh: () => void;
};

export function useGovernedConsultationActivationWorkspace(
  options: UseGovernedConsultationActivationWorkspaceOptions,
): UseGovernedConsultationActivationWorkspaceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedConsultationActivationWorkspaceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedConsultationActivationWorkspaceResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void adapter
      .getGovernedConsultationActivationWorkspace(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toAiClinicalUserMessage(err));
          setResult(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adapter, enabled, sessionId, tick]);

  return { loading, error, result, refresh };
}
