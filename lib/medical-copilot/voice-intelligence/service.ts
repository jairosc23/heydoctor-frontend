/**
 * CP-32 — ClinicalVoiceIntelligenceService.
 * Stateless analyzer facade — never mutates dictation or persists analysis.
 */

import { analyzeClinicalVoiceText } from "./analyze";
import type {
  ClinicalVoiceAnalysis,
  ClinicalVoiceIntelligenceOptions,
} from "./types";

export type ClinicalVoiceIntelligenceService = {
  /**
   * Analyze a snapshot of dictated text.
   * Caller must pass buffer.draft; service never reads/writes DictationBuffer.
   */
  analyze(
    text: string,
    options?: ClinicalVoiceIntelligenceOptions,
  ): ClinicalVoiceAnalysis;
};

export function createClinicalVoiceIntelligenceService(
  defaultOptions: ClinicalVoiceIntelligenceOptions = {},
): ClinicalVoiceIntelligenceService {
  return {
    analyze(text, options) {
      return analyzeClinicalVoiceText(text, {
        ...defaultOptions,
        ...options,
        reminders: options?.reminders ?? defaultOptions.reminders,
        expectedSections:
          options?.expectedSections ?? defaultOptions.expectedSections,
      });
    },
  };
}
