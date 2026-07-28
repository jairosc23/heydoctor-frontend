"use client";

import { useCallback, useEffect, useState } from "react";
import {
  bindClinicalContext,
  getClinicalContextStatus,
} from "@/lib/clinical-context/api";
import type { ClinicalContextBindingRecord } from "@/lib/clinical-context/types";

export type BoundClinicalContextState = {
  status: "idle" | "loading" | "bound" | "unbound" | "error";
  record: ClinicalContextBindingRecord | null;
  error: string | null;
  refresh: () => Promise<void>;
  bind: () => Promise<void>;
};

/**
 * E05 FE consumer — reflects BE bind status. Never sole-sources authority.
 */
export function useBoundClinicalContext(
  consultationId: string | null | undefined,
  options?: { autoBind?: boolean; enabled?: boolean },
): BoundClinicalContextState {
  const enabled = options?.enabled !== false;
  const autoBind = options?.autoBind === true;
  const [status, setStatus] =
    useState<BoundClinicalContextState["status"]>("idle");
  const [record, setRecord] = useState<ClinicalContextBindingRecord | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !consultationId) {
      setStatus("idle");
      setRecord(null);
      return;
    }
    setStatus("loading");
    try {
      const data = await getClinicalContextStatus(consultationId);
      if (data.bound && data.record) {
        setRecord(data.record);
        setStatus("bound");
        setError(null);
        return;
      }
      if (autoBind) {
        const bound = await bindClinicalContext(consultationId);
        setRecord(bound);
        setStatus("bound");
        setError(null);
        return;
      }
      setRecord(null);
      setStatus("unbound");
      setError(null);
    } catch (err) {
      setRecord(null);
      setStatus("error");
      setError(err instanceof Error ? err.message : "context_status_failed");
    }
  }, [autoBind, consultationId, enabled]);

  const bind = useCallback(async () => {
    if (!consultationId) return;
    setStatus("loading");
    try {
      const bound = await bindClinicalContext(consultationId);
      setRecord(bound);
      setStatus("bound");
      setError(null);
    } catch (err) {
      setStatus("unbound");
      setError(err instanceof Error ? err.message : "context_bind_failed");
    }
  }, [consultationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, record, error, refresh, bind };
}
