"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useClinicalIntelligence } from "./ClinicalIntelligenceContext";
import { useAutonomousWorkflowPlan } from "@/hooks/useAutonomousWorkflowPlan";
import { useClinicalFlowSuggestions } from "@/hooks/useClinicalFlowSuggestions";
import { applyUnifiedClinicalPlan } from "@/lib/apply-unified-clinical-plan";
import { recordWorkflowPlanDecision } from "@/lib/services/autonomous-workflow";
import {
  applyItemOverrides,
  buildUnifiedPlanFromWorkflow,
  countUnifiedPlanItems,
  resolveUnifiedClinicalPlan,
  unifiedPlanHasActions,
} from "@/lib/unified-clinical-plan";
import type {
  UnifiedClinicalPlan,
  UnifiedPlanApplyResult,
  UnifiedPlanViewMode,
} from "@/lib/types/unified-clinical-plan";

export type ConsultationPlanContextValue = {
  plan: UnifiedClinicalPlan | null;
  loading: boolean;
  error: string | null;
  viewMode: UnifiedPlanViewMode;
  applying: boolean;
  applied: boolean;
  applyError: string | null;
  itemCount: number;
  reviewPlan: () => void;
  editPlan: () => void;
  closeDetail: () => void;
  toggleItem: (itemId: string, enabled: boolean) => void;
  applyPlan: () => Promise<UnifiedPlanApplyResult | null>;
  canApply: boolean;
};

const ConsultationPlanContext = createContext<ConsultationPlanContextValue | null>(
  null,
);

export function ConsultationPlanProvider({
  patientId,
  consultationId,
  countryCode = "CL",
  onPlanApplied,
  children,
}: {
  patientId: string;
  consultationId?: string;
  countryCode?: string;
  onPlanApplied?: (result: UnifiedPlanApplyResult) => void;
  children: ReactNode;
}) {
  const {
    cie10CodeId,
    diagnosisLabel,
    diagnosisContext,
    flowSuggestionsRefreshKey,
    invalidateDrugSuggestions,
  } = useClinicalIntelligence();

  const workflow = useAutonomousWorkflowPlan({
    patientId,
    consultationId,
    countryCode,
  });

  const diagnosisCode = useMemo(
    () =>
      diagnosisContext?.code?.trim() ||
      workflow.data?.plan?.diagnosis[0]?.code?.trim() ||
      null,
    [diagnosisContext?.code, workflow.data?.plan?.diagnosis],
  );

  const workflowHasItems = useMemo(() => {
    if (!workflow.data?.plan) return false;
    return unifiedPlanHasActions(
      buildUnifiedPlanFromWorkflow(workflow.data.plan),
    );
  }, [workflow.data?.plan]);

  const hasDiagnosis = Boolean(cie10CodeId || diagnosisCode);

  const flow = useClinicalFlowSuggestions({
    cie10CodeId: cie10CodeId ?? undefined,
    cie10Code: diagnosisCode ?? undefined,
    countryCode,
    enabled: hasDiagnosis && !workflowHasItems && !workflow.loading,
    refreshKey: flowSuggestionsRefreshKey,
  });

  const basePlan = useMemo(
    () =>
      resolveUnifiedClinicalPlan({
        workflowPlan: workflow.data?.plan ?? null,
        flow: flow.data,
        diagnosisCode,
        diagnosisLabel:
          diagnosisContext?.description ??
          workflow.data?.plan?.diagnosis[0]?.label ??
          diagnosisLabel,
      }),
    [
      workflow.data?.plan,
      flow.data,
      diagnosisCode,
      diagnosisContext?.description,
      diagnosisLabel,
    ],
  );

  const [itemOverrides, setItemOverrides] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<UnifiedPlanViewMode>("summary");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    setItemOverrides({});
    setViewMode("summary");
    setApplied(false);
    setApplyError(null);
  }, [basePlan?.planId, basePlan?.title, cie10CodeId]);

  const plan = useMemo(
    () => (basePlan ? applyItemOverrides(basePlan, itemOverrides) : null),
    [basePlan, itemOverrides],
  );

  const loading =
    workflow.loading ||
    (hasDiagnosis && !workflowHasItems && flow.loading && !basePlan);
  const error = workflow.error ?? flow.error;

  const toggleItem = useCallback((itemId: string, enabled: boolean) => {
    setItemOverrides((prev) => ({ ...prev, [itemId]: enabled }));
  }, []);

  const applyPlan = useCallback(async () => {
    if (!plan || !patientId || !unifiedPlanHasActions(plan)) return null;
    setApplying(true);
    setApplyError(null);
    try {
      const result = await applyUnifiedClinicalPlan({
        plan,
        patientId,
        consultationId,
        cie10CodeId: cie10CodeId ?? undefined,
        diagnosisLabel: diagnosisLabel ?? undefined,
      });

      if (plan.planId) {
        await recordWorkflowPlanDecision({
          planId: plan.planId,
          patientId,
          decision: "accepted",
        });
      }

      setApplied(true);
      setViewMode("summary");
      invalidateDrugSuggestions();
      onPlanApplied?.(result);
      return result;
    } catch (e) {
      setApplyError(e instanceof Error ? e.message : "Error al aplicar plan");
      return null;
    } finally {
      setApplying(false);
    }
  }, [
    plan,
    patientId,
    consultationId,
    cie10CodeId,
    diagnosisLabel,
    invalidateDrugSuggestions,
    onPlanApplied,
  ]);

  const value = useMemo<ConsultationPlanContextValue>(
    () => ({
      plan,
      loading,
      error,
      viewMode,
      applying,
      applied,
      applyError,
      itemCount: plan ? countUnifiedPlanItems(plan) : 0,
      reviewPlan: () => setViewMode("review"),
      editPlan: () => setViewMode("edit"),
      closeDetail: () => setViewMode("summary"),
      toggleItem,
      applyPlan,
      canApply: Boolean(plan && unifiedPlanHasActions(plan) && !applied),
    }),
    [
      plan,
      loading,
      error,
      viewMode,
      applying,
      applied,
      applyError,
      toggleItem,
      applyPlan,
    ],
  );

  return (
    <ConsultationPlanContext.Provider value={value}>
      {children}
    </ConsultationPlanContext.Provider>
  );
}

export function useConsultationPlan(): ConsultationPlanContextValue {
  const ctx = useContext(ConsultationPlanContext);
  if (!ctx) {
    throw new Error("useConsultationPlan must be used within ConsultationPlanProvider");
  }
  return ctx;
}

export function useOptionalConsultationPlan(): ConsultationPlanContextValue | null {
  return useContext(ConsultationPlanContext);
}
