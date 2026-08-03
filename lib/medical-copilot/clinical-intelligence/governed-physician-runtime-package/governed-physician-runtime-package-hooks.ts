"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPhysicianRuntimePackageReadAdapter,
  type GovernedPhysicianRuntimePackageReadAdapter,
} from "./governed-physician-runtime-package-adapter";
import type { GovernedPhysicianRuntimePackageResult } from "./governed-physician-runtime-package";

export type UseGovernedPhysicianRuntimePackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPhysicianRuntimePackageReadAdapter;
};

export type UseGovernedPhysicianRuntimePackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPhysicianRuntimePackageResult | null;
  refresh: () => void;
};

export function useGovernedPhysicianRuntimePackage(
  options: UseGovernedPhysicianRuntimePackageOptions,
): UseGovernedPhysicianRuntimePackageResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPhysicianRuntimePackageReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianRuntimePackageResult | null>(null);
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
      .getGovernedPhysicianRuntimePackage(sessionId)
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
