/**
 * Product Platform contracts (PRODUCT-1, PRODUCT-2).
 * Separate from Core Platform. Epics consume Core; they do not modify it.
 */

export const PRODUCT_EPIC_CONTRACT_SECTIONS = [
  "Objective",
  "Dependencies",
  "Read Model",
  "No Writes",
  "PASS",
  "Metrics",
] as const;

export type ProductEpicContractSection =
  (typeof PRODUCT_EPIC_CONTRACT_SECTIONS)[number];

export type ProductEpicContract = {
  Objective: string;
  Dependencies: string;
  "Read Model": string;
  "No Writes": string;
  PASS: readonly string[];
  Metrics: readonly string[];
};

export type ProductEpicMetrics = Record<string, number>;
