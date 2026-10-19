import {
  ENCOUNTER_CIC_ID,
  ENCOUNTER_HAB_ID,
  ENCOUNTER_OFFER_ID,
  PRIMARY_ENCOUNTER_SECTION_NUMBERS,
  classifyEncounterSectionLane,
} from "./clinical-navigation-rail-model";

/**
 * E4 hot path: Signature-ready live work. CIP / Knowledge GET previews
 * are disclosure and must not spend the encounter-open latency budget.
 */
export const ENCOUNTER_HOT_PATH_SECTION_NUMBERS =
  PRIMARY_ENCOUNTER_SECTION_NUMBERS;

export const ENCOUNTER_HOT_PATH_LANDMARK_IDS = [
  ENCOUNTER_OFFER_ID,
  ENCOUNTER_HAB_ID,
  ENCOUNTER_CIC_ID,
] as const;

/** E1 persist sites on the live path. E4 does not change HAB or persist. */
export const ENCOUNTER_HOT_PATH_PERSIST_SURFACES = [
  "prescription",
  "lab_order",
  "referral",
  "sign",
] as const;

/** Constitutional GET previews (sections 21, 23–44). */
export const DISCLOSURE_PREVIEW_SECTION_COUNT = 23;

/**
 * E4-1 baseline: disclosure sections were mounted (hidden) on encounter open,
 * so 23 GET previews raced the primary path.
 */
export const ENCOUNTER_OPEN_DISCLOSURE_FETCH_BASELINE =
  DISCLOSURE_PREVIEW_SECTION_COUNT;

export function isEncounterHotPathSectionNumber(
  sectionNumber: number,
): boolean {
  return classifyEncounterSectionLane(sectionNumber) === "primary";
}

export function isEncounterHotPathId(sectionId: string): boolean {
  if (
    (ENCOUNTER_HOT_PATH_LANDMARK_IDS as readonly string[]).includes(sectionId)
  ) {
    return true;
  }
  const match = /^encounter-section-(\d+)$/.exec(sectionId);
  if (!match) return false;
  return isEncounterHotPathSectionNumber(Number(match[1]));
}

export function shouldMountDisclosurePreviews(
  disclosureExpanded: boolean,
): boolean {
  return disclosureExpanded;
}

/**
 * E4-2 budget: collapsed encounter open must not start disclosure GETs.
 * Expanded / deep-link may load all 23 (same HTTP contracts).
 */
export function disclosurePreviewFetchesOnEncounterOpen(
  disclosureExpanded: boolean,
): number {
  return shouldMountDisclosurePreviews(disclosureExpanded)
    ? DISCLOSURE_PREVIEW_SECTION_COUNT
    : 0;
}

export function encounterOpenFetchBudgetImprovedVersusBaseline(
  disclosureExpanded: boolean,
): boolean {
  return (
    disclosurePreviewFetchesOnEncounterOpen(disclosureExpanded) <
    ENCOUNTER_OPEN_DISCLOSURE_FETCH_BASELINE
  );
}
