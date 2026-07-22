/**
 * Prescription Calculation Engine (PR-3).
 *
 * Architecture:
 *   Calculation Engine → Composer (display) → Persistence (unchanged)
 *
 * Pure, deterministic math. No AI. No heuristics. No Backend / PDF / Safety.
 */

import {
  emptyCalculationDisplay,
  type CalculationInput,
  type CalculationResult,
} from "./types";
import {
  formatAmount,
  parseDose,
  parseDurationDays,
  parseFrequency,
  pluralizeUnit,
  resolveQuantityUnit,
} from "./parsers";
import type { SelectedMedication } from "../types/selected-medication";

export function calculatePrescription(
  input: CalculationInput,
): CalculationResult {
  const dosage = input.dosage.trim();
  const frequency = input.frequency.trim();
  const duration = input.duration.trim();

  if (!dosage) {
    return incomplete("missing_dosage");
  }
  if (!frequency) {
    return incomplete("missing_frequency");
  }
  if (!duration) {
    return incomplete("missing_duration");
  }

  const dose = parseDose(dosage);
  if (!dose) {
    return incomplete("unparseable_dosage");
  }

  const freq = parseFrequency(frequency);
  if (freq.kind === "prn") {
    return {
      status: "non_deterministic",
      reasonCode: "prn_non_deterministic",
      doseAmount: dose.amount,
      doseUnit: resolveQuantityUnit(dose.unit, input.dosageForm),
      display: {
        quantity: "Sin cálculo automático (PRN)",
        dailyConsumption: "—",
        duration: formatDurationDisplay(parseDurationDays(duration)),
      },
    };
  }
  if (freq.kind === "unparseable") {
    return incomplete("unparseable_frequency");
  }

  const durationDays = parseDurationDays(duration);
  if (durationDays == null) {
    return incomplete("unparseable_duration");
  }

  const dosesPerDay = freq.dosesPerDay;
  if (!Number.isFinite(dosesPerDay) || dosesPerDay <= 0) {
    return incomplete("invalid_interval");
  }

  const unit = resolveQuantityUnit(dose.unit, input.dosageForm);
  const dailyConsumption = dose.amount * dosesPerDay;
  const totalQuantity = dailyConsumption * durationDays;
  // Presentation-adjusted final quantity (pack size not in FE catalog yet).
  const finalQuantity = totalQuantity;

  return {
    status: "computed",
    doseAmount: dose.amount,
    doseUnit: unit,
    dosesPerDay,
    durationDays,
    dailyConsumption,
    totalQuantity,
    finalQuantity,
    quantityUnit: unit,
    display: {
      quantity: `${formatAmount(finalQuantity)} ${pluralizeUnit(finalQuantity, unit)}`,
      dailyConsumption: `${formatAmount(dailyConsumption)} ${pluralizeUnit(dailyConsumption, unit)}/día`,
      duration: `${formatAmount(durationDays)} ${durationDays === 1 ? "día" : "días"}`,
    },
  };
}

/** Composer adapter — no math in UI layer. */
export function calculateFromSelectedMedication(
  line: SelectedMedication,
): CalculationResult {
  return calculatePrescription({
    dosage: line.dosage,
    frequency: line.frequency,
    duration: line.duration,
    dosageForm: line.dosageForm,
    strengthDisplay: line.strengthDisplay,
  });
}

function incomplete(
  reasonCode: NonNullable<CalculationResult["reasonCode"]>,
): CalculationResult {
  return {
    status: "incomplete",
    reasonCode,
    display: emptyCalculationDisplay(),
  };
}

function formatDurationDisplay(days: number | null): string {
  if (days == null) return "—";
  return `${formatAmount(days)} ${days === 1 ? "día" : "días"}`;
}

export type { CalculationInput, CalculationResult, CalculationStatus } from "./types";
