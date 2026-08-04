"use client";

/**
 * @deprecated Prefer useEncounterSectionNavigation (Encounter Navigation SSOT).
 * Thin compatibility wrapper — no independent scroll logic.
 */

import {
  useEncounterSectionNavigation,
  type EncounterSectionNavSection,
  type UseEncounterSectionNavigationOptions,
  type UseEncounterSectionNavigationResult,
} from "./useEncounterSectionNavigation";

export type ClinicalSectionSpySection = EncounterSectionNavSection;
export type UseClinicalSectionSpyOptions = UseEncounterSectionNavigationOptions;
export type UseClinicalSectionSpyResult = Pick<
  UseEncounterSectionNavigationResult,
  "activeSectionId" | "navigateToSection"
>;

export function useClinicalSectionSpy(
  sections: ClinicalSectionSpySection[],
  options: UseClinicalSectionSpyOptions = {},
): UseClinicalSectionSpyResult {
  const { activeSectionId, navigateToSection } = useEncounterSectionNavigation(
    sections,
    options,
  );
  return { activeSectionId, navigateToSection };
}
