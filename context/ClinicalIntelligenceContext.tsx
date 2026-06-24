"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  DiagnosisContext,
  SelectedDiagnosis,
} from "@/lib/types/clinical-intelligence-flow";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";

export interface ClinicalIntelligenceContextValue {
  consultationId: string | null;
  patientId: string | null;
  countryCode: string;
  cie10CodeId: string | null;
  diagnosisLabel: string | null;
  diagnosisContext: DiagnosisContext | null;
  clinicalFoundation: ClinicalFoundationBundle | null;
  drugSuggestionsRefreshKey: number;
  diagnosisSuggestionsRefreshKey: number;
  flowSuggestionsRefreshKey: number;
  setConsultationScope: (scope: {
    consultationId?: string | null;
    patientId?: string | null;
    countryCode?: string;
  }) => void;
  setDiagnosis: (diagnosis: SelectedDiagnosis | null) => void;
  setDiagnosisContext: (context: DiagnosisContext | null) => void;
  invalidateDrugSuggestions: () => void;
  invalidateDiagnosisSuggestions: () => void;
}

const ClinicalIntelligenceContext =
  createContext<ClinicalIntelligenceContextValue | null>(null);

export function ClinicalIntelligenceProvider({
  children,
  initialConsultationId = null,
  initialPatientId = null,
  initialCountryCode = "CL",
  initialDiagnosis = null,
  clinicalFoundation = null,
}: {
  children: ReactNode;
  initialConsultationId?: string | null;
  initialPatientId?: string | null;
  initialCountryCode?: string;
  initialDiagnosis?: SelectedDiagnosis | null;
  clinicalFoundation?: ClinicalFoundationBundle | null;
}) {
  const [consultationId, setConsultationId] = useState<string | null>(
    initialConsultationId,
  );
  const [patientId, setPatientId] = useState<string | null>(initialPatientId);
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [cie10CodeId, setCie10CodeId] = useState<string | null>(
    initialDiagnosis?.cie10CodeId ?? null,
  );
  const [diagnosisLabel, setDiagnosisLabel] = useState<string | null>(
    initialDiagnosis
      ? `${initialDiagnosis.code} — ${initialDiagnosis.description}`
      : null,
  );
  const [diagnosisContext, setDiagnosisContextState] =
    useState<DiagnosisContext | null>(
      initialDiagnosis
        ? {
            cie10CodeId: initialDiagnosis.cie10CodeId,
            code: initialDiagnosis.code,
            description: initialDiagnosis.description,
          }
        : null,
    );
  const [drugSuggestionsRefreshKey, setDrugSuggestionsRefreshKey] = useState(0);
  const [diagnosisSuggestionsRefreshKey, setDiagnosisSuggestionsRefreshKey] =
    useState(0);
  const [flowSuggestionsRefreshKey, setFlowSuggestionsRefreshKey] = useState(0);

  const setConsultationScope = useCallback(
    (scope: {
      consultationId?: string | null;
      patientId?: string | null;
      countryCode?: string;
    }) => {
      if (scope.consultationId !== undefined) setConsultationId(scope.consultationId);
      if (scope.patientId !== undefined) setPatientId(scope.patientId);
      if (scope.countryCode !== undefined) setCountryCode(scope.countryCode);
    },
    [],
  );

  const setDiagnosis = useCallback((diagnosis: SelectedDiagnosis | null) => {
    if (!diagnosis) {
      setCie10CodeId(null);
      setDiagnosisLabel(null);
      setDiagnosisContextState(null);
      return;
    }
    setCie10CodeId(diagnosis.cie10CodeId);
    setDiagnosisLabel(`${diagnosis.code} — ${diagnosis.description}`);
    setDiagnosisContextState({
      cie10CodeId: diagnosis.cie10CodeId,
      code: diagnosis.code,
      description: diagnosis.description,
    });
    setDrugSuggestionsRefreshKey((k) => k + 1);
    setFlowSuggestionsRefreshKey((k) => k + 1);
  }, []);

  const setDiagnosisContext = useCallback((context: DiagnosisContext | null) => {
    setDiagnosisContextState(context);
    if (context) {
      setCie10CodeId(context.cie10CodeId);
      setDiagnosisLabel(`${context.code} — ${context.description}`);
      setDrugSuggestionsRefreshKey((k) => k + 1);
      setFlowSuggestionsRefreshKey((k) => k + 1);
    }
  }, []);

  const invalidateDrugSuggestions = useCallback(() => {
    setDrugSuggestionsRefreshKey((k) => k + 1);
  }, []);

  const invalidateDiagnosisSuggestions = useCallback(() => {
    setDiagnosisSuggestionsRefreshKey((k) => k + 1);
  }, []);

  const value = useMemo<ClinicalIntelligenceContextValue>(
    () => ({
      consultationId,
      patientId,
      countryCode,
      cie10CodeId,
      diagnosisLabel,
      diagnosisContext,
      clinicalFoundation,
      drugSuggestionsRefreshKey,
      diagnosisSuggestionsRefreshKey,
      flowSuggestionsRefreshKey,
      setConsultationScope,
      setDiagnosis,
      setDiagnosisContext,
      invalidateDrugSuggestions,
      invalidateDiagnosisSuggestions,
    }),
    [
      consultationId,
      patientId,
      countryCode,
      cie10CodeId,
      diagnosisLabel,
      diagnosisContext,
      clinicalFoundation,
      drugSuggestionsRefreshKey,
      diagnosisSuggestionsRefreshKey,
      flowSuggestionsRefreshKey,
      setConsultationScope,
      setDiagnosis,
      setDiagnosisContext,
      invalidateDrugSuggestions,
      invalidateDiagnosisSuggestions,
    ],
  );

  return (
    <ClinicalIntelligenceContext.Provider value={value}>
      {children}
    </ClinicalIntelligenceContext.Provider>
  );
}

export function useClinicalIntelligence(): ClinicalIntelligenceContextValue {
  const ctx = useContext(ClinicalIntelligenceContext);
  if (!ctx) {
    throw new Error(
      "useClinicalIntelligence must be used within ClinicalIntelligenceProvider",
    );
  }
  return ctx;
}

export function useOptionalClinicalIntelligence(): ClinicalIntelligenceContextValue | null {
  return useContext(ClinicalIntelligenceContext);
}
