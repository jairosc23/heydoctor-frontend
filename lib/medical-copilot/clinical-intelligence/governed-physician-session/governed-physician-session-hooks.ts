"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPhysicianSessionReadAdapter,
  type GovernedPhysicianSessionReadAdapter,
} from "./governed-physician-session-adapter";
import type { GovernedPhysicianSessionResult } from "./governed-physician-session";

export type UseGovernedPhysicianSessionOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPhysicianSessionReadAdapter;
};

export type UseGovernedPhysicianSessionResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPhysicianSessionResult | null;
  refresh: () => void;
};

export function useGovernedPhysicianSession(
  options: UseGovernedPhysicianSessionOptions,
): UseGovernedPhysicianSessionResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPhysicianSessionReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianSessionResult | null>(null);
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
      .getGovernedPhysicianSession(sessionId)
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
