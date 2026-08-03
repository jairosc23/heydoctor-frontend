"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalRepositoryDiscoveryReadAdapter,
  type GovernedClinicalRepositoryDiscoveryReadAdapter,
} from "./governed-clinical-repository-discovery-adapter";
import type { GovernedClinicalRepositoryDiscoveryResult } from "./governed-clinical-repository-discovery";

export type UseGovernedClinicalRepositoryDiscoveryOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalRepositoryDiscoveryReadAdapter;
};

export type UseGovernedClinicalRepositoryDiscoveryResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalRepositoryDiscoveryResult | null;
  refresh: () => void;
};

export function useGovernedClinicalRepositoryDiscovery(
  options: UseGovernedClinicalRepositoryDiscoveryOptions,
): UseGovernedClinicalRepositoryDiscoveryResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalRepositoryDiscoveryReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalRepositoryDiscoveryResult | null>(null);
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
      .getGovernedClinicalRepositoryDiscovery(sessionId)
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
