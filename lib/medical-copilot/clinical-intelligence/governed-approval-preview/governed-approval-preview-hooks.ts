"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedApprovalPreviewReadAdapter,
  type GovernedApprovalPreviewReadAdapter,
} from "./governed-approval-preview-adapter";
import type { GovernedApprovalPreviewResult } from "./governed-approval-preview";

export type UseGovernedApprovalPreviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedApprovalPreviewReadAdapter;
};

export type UseGovernedApprovalPreviewResult = {
  loading: boolean;
  error: string | null;
  result: GovernedApprovalPreviewResult | null;
  refresh: () => void;
};

export function useGovernedApprovalPreview(
  options: UseGovernedApprovalPreviewOptions,
): UseGovernedApprovalPreviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedApprovalPreviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedApprovalPreviewResult | null>(null);
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
      .getGovernedApprovalPreview(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
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
