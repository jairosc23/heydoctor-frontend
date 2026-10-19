"use client";

/**
 * CP-32 — ClinicalVoiceIntelligenceContext.
 * Reads dictation draft via hooks only — never mutates DictationBuffer/Service.
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useDictationBuffer } from "@/context/ClinicalDictationContext";
import {
  createClinicalVoiceIntelligenceService,
  type ClinicalVoiceIntelligenceService,
} from "@/lib/medical-copilot/voice-intelligence/service";
import type {
  ClinicalSuggestion,
  ClinicalVoiceAnalysis,
  ClinicalVoiceIntelligenceOptions,
} from "@/lib/medical-copilot/voice-intelligence/types";

export type ClinicalVoiceIntelligenceContextValue = {
  analysis: ClinicalVoiceAnalysis;
  suggestions: ClinicalSuggestion[];
  analyze: (text?: string) => ClinicalVoiceAnalysis;
  service: ClinicalVoiceIntelligenceService;
};

const ClinicalVoiceIntelligenceContext =
  createContext<ClinicalVoiceIntelligenceContextValue | null>(null);

export type ClinicalVoiceIntelligenceProviderProps = {
  children: ReactNode;
  options?: ClinicalVoiceIntelligenceOptions;
  service?: ClinicalVoiceIntelligenceService;
};

export function ClinicalVoiceIntelligenceProvider({
  children,
  options,
  service: injected,
}: ClinicalVoiceIntelligenceProviderProps) {
  const buffer = useDictationBuffer();
  const service = useMemo(
    () => injected ?? createClinicalVoiceIntelligenceService(options),
    [injected, options],
  );

  const analysis = useMemo(
    () => service.analyze(buffer.draft, options),
    [service, buffer.draft, options],
  );

  const value = useMemo<ClinicalVoiceIntelligenceContextValue>(
    () => ({
      analysis,
      suggestions: analysis.suggestions,
      analyze: (text) => service.analyze(text ?? buffer.draft, options),
      service,
    }),
    [analysis, service, buffer.draft, options],
  );

  return (
    <ClinicalVoiceIntelligenceContext.Provider value={value}>
      {children}
    </ClinicalVoiceIntelligenceContext.Provider>
  );
}

function useClinicalVoiceIntelligenceContext(): ClinicalVoiceIntelligenceContextValue {
  const ctx = useContext(ClinicalVoiceIntelligenceContext);
  if (!ctx) {
    throw new Error(
      "useClinicalVoiceIntelligence must be used within ClinicalVoiceIntelligenceProvider",
    );
  }
  return ctx;
}

export function useClinicalVoiceIntelligence(): ClinicalVoiceIntelligenceContextValue {
  return useClinicalVoiceIntelligenceContext();
}

export function useClinicalVoiceSuggestions(): ClinicalSuggestion[] {
  return useClinicalVoiceIntelligenceContext().suggestions;
}

export function useClinicalVoiceAnalysis(): ClinicalVoiceAnalysis {
  return useClinicalVoiceIntelligenceContext().analysis;
}
