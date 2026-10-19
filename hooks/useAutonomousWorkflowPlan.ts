"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAutonomousWorkflowPlan,
  recordWorkflowPlanDecision,
} from "@/lib/services/autonomous-workflow";
import type {
  AutonomousWorkflowPlanResponse,
  WorkflowPlanDecision,
} from "@/lib/types/autonomous-workflow";

export function useAutonomousWorkflowPlan(params: {
  patientId?: string | null;
  consultationId?: string | null;
  countryCode?: string;
}) {
  const [data, setData] = useState<AutonomousWorkflowPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<WorkflowPlanDecision | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!params.patientId) {
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAutonomousWorkflowPlan({
        patientId: params.patientId,
        countryCode: params.countryCode,
        consultationId: params.consultationId ?? undefined,
      });
      setData(result);
      setDecision(null);
      setReviewOpen(false);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Error al cargar plan de workflow");
    } finally {
      setLoading(false);
    }
  }, [params.patientId, params.consultationId, params.countryCode]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitDecision = useCallback(
    async (next: WorkflowPlanDecision) => {
      if (!params.patientId || !data?.plan) return;
      setDecisionLoading(true);
      try {
        await recordWorkflowPlanDecision({
          planId: data.plan.planId,
          patientId: params.patientId,
          decision: next,
        });
        setDecision(next);
        if (next === "reviewed") setReviewOpen(true);
      } finally {
        setDecisionLoading(false);
      }
    },
    [params.patientId, data?.plan],
  );

  return {
    data,
    loading,
    error,
    decision,
    reviewOpen,
    decisionLoading,
    reload: load,
    acceptPlan: () => submitDecision("accepted"),
    rejectPlan: () => submitDecision("rejected"),
    reviewPlan: () => submitDecision("reviewed"),
  };
}
