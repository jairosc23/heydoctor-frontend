/**
 * Prescription Calculation Engine (PR-3) — enriched deterministic model.
 *
 * Architecture:
 *   Calculation Engine → Composer (display) → Persistence (unchanged)
 *
 * Explicit factors (never overloaded):
 *   dosePerAdministration × administrationsPerDay × durationDays = totalQuantity
 */

import {
  emptyCalculationDisplay,
  type CalculationInput,
  type CalculationReasonCode,
  type CalculationResult,
  type MathExplanation,
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

  if (!dosage) return incomplete("missing_dosage");
  if (!frequency) return incomplete("missing_frequency");
  if (!duration) return incomplete("missing_duration");

  const dose = parseDose(dosage);
  if (!dose) return unsupported("unparseable_dosage");

  const freq = parseFrequency(frequency);
  if (freq.kind === "prn") {
    const unit = resolveQuantityUnit(dose.unit, input.dosageForm);
    const durationDays = parseDurationDays(duration);
    return {
      status: "non_deterministic",
      reasonCode: "prn_non_deterministic",
      dosePerAdministration: dose.amount,
      unit,
      durationDays: durationDays ?? undefined,
      display: {
        quantity: "Sin cálculo automático (PRN)",
        dailyConsumption: "—",
        duration: formatDurationDisplay(durationDays),
        explanation:
          "Frecuencia PRN: no hay administraciones/día determinísticas",
      },
    };
  }
  if (freq.kind === "unparseable") {
    return unsupported("unparseable_frequency");
  }

  const durationDays = parseDurationDays(duration);
  if (durationDays == null) {
    return unsupported("unparseable_duration");
  }

  const administrationsPerDay = freq.administrationsPerDay;
  if (!Number.isFinite(administrationsPerDay) || administrationsPerDay <= 0) {
    return unsupported("invalid_interval");
  }

  const unit = resolveQuantityUnit(dose.unit, input.dosageForm);
  const dosePerAdministration = dose.amount;
  const dailyConsumption = dosePerAdministration * administrationsPerDay;
  const totalQuantity = dailyConsumption * durationDays;
  const finalQuantity = totalQuantity;

  const explanation = buildExplanation({
    dosePerAdministration,
    administrationsPerDay,
    durationDays,
    dailyConsumption,
    totalQuantity,
    unit,
  });

  return {
    status: "deterministic",
    dosePerAdministration,
    administrationsPerDay,
    dailyConsumption,
    durationDays,
    totalQuantity,
    finalQuantity,
    unit,
    explanation,
    display: {
      quantity: `${formatAmount(finalQuantity)} ${pluralizeUnit(finalQuantity, unit)}`,
      dailyConsumption: `${formatAmount(dailyConsumption)} ${pluralizeUnit(dailyConsumption, unit)}/día`,
      duration: `${formatAmount(durationDays)} ${durationDays === 1 ? "día" : "días"}`,
      explanation: explanation.formula,
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

export function buildExplanation(parts: {
  dosePerAdministration: number;
  administrationsPerDay: number;
  durationDays: number;
  dailyConsumption: number;
  totalQuantity: number;
  unit: string;
}): MathExplanation {
  const doseLabel = `${formatAmount(parts.dosePerAdministration)} ${pluralizeUnit(parts.dosePerAdministration, parts.unit)}`;
  const adminLabel = `${formatAmount(parts.administrationsPerDay)} ${
    parts.administrationsPerDay === 1
      ? "administración/día"
      : "administraciones/día"
  }`;
  const daysLabel = `${formatAmount(parts.durationDays)} ${
    parts.durationDays === 1 ? "día" : "días"
  }`;
  const totalLabel = `${formatAmount(parts.totalQuantity)} ${pluralizeUnit(parts.totalQuantity, parts.unit)}`;

  return {
    dosePerAdministration: parts.dosePerAdministration,
    administrationsPerDay: parts.administrationsPerDay,
    durationDays: parts.durationDays,
    dailyConsumption: parts.dailyConsumption,
    totalQuantity: parts.totalQuantity,
    unit: parts.unit,
    formula: `${doseLabel} × ${adminLabel} × ${daysLabel} = ${totalLabel}`,
  };
}

function incomplete(reasonCode: CalculationReasonCode): CalculationResult {
  return {
    status: "incomplete",
    reasonCode,
    display: emptyCalculationDisplay(),
  };
}

function unsupported(reasonCode: CalculationReasonCode): CalculationResult {
  return {
    status: "unsupported",
    reasonCode,
    display: emptyCalculationDisplay(),
  };
}

function formatDurationDisplay(days: number | null): string {
  if (days == null) return "—";
  return `${formatAmount(days)} ${days === 1 ? "día" : "días"}`;
}

export type {
  CalculationInput,
  CalculationResult,
  CalculationStatus,
  MathExplanation,
} from "./types";
