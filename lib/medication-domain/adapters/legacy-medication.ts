/**
 * Legacy adapter — Medication Domain ↔ SelectedMedication / MedicationItem.
 * Implements ADR-020 P1. Domain remains SSOT; strings are persistence bridge only.
 */

import {
  durationCodeFromSpec,
  durationSpecFromCode,
  findEntry,
  frequencyCodeFromSpec,
  frequencySpecFromCode,
  getCatalog,
  labelFor,
} from "../catalogs";
import type {
  JurisdictionCode,
  MedicationOrderLine,
  MedicationProductRef,
  StructuredPosology,
} from "../types";
import { emptyPosology } from "../types";
import type { MedicationItem } from "@/lib/services/prescriptions";
import type { SelectedMedication } from "@/lib/types/selected-medication";
import { emptySelectedMedication } from "@/lib/types/selected-medication";
import {
  mergeInstructionsAndObservations,
  splitInstructionsAndObservations,
} from "@/lib/prescription-composer";

const OBS_PREFIX = "Obs.: ";

/** Persistence-oriented strings derived from StructuredPosology (not SSOT). */
export type LegacyPosologyStrings = {
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
};

export function legacyStringsFromPosology(
  posology: StructuredPosology,
  jurisdictionCode: JurisdictionCode = "CL",
): LegacyPosologyStrings {
  const catalog = getCatalog(jurisdictionCode);
  const { locale } = catalog;

  let dosage = "";
  if (posology.dose) {
    const unitEntry = findEntry(catalog.doseUnits, posology.dose.unit);
    const unitLabel = unitEntry
      ? labelFor(unitEntry, locale)
      : posology.dose.unit;
    dosage = `${posology.dose.amount} ${unitLabel}`.trim();
  }

  let frequency = "";
  const freqCode = frequencyCodeFromSpec(posology.frequency);
  const freqEntry = findEntry(catalog.frequencies, freqCode ?? undefined);
  if (freqEntry) {
    // Prefer parser-friendly Spanish interval forms when possible.
    if (posology.frequency?.kind === "EVERY_N_HOURS") {
      frequency = `cada ${posology.frequency.hours} horas`;
    } else if (posology.frequency?.kind === "TIMES_PER_DAY") {
      frequency = `${posology.frequency.times} veces al día`;
    } else {
      frequency = labelFor(freqEntry, locale);
    }
  } else if (posology.frequency?.kind === "CUSTOM") {
    frequency = posology.frequency.code;
  }

  let duration = "";
  if (posology.duration?.kind === "N_DAYS") {
    duration = `${posology.duration.days} días`;
  } else if (posology.duration?.kind === "N_WEEKS") {
    duration = `${posology.duration.weeks * 7} días`;
  } else if (posology.duration?.kind === "N_MONTHS") {
    duration = `${posology.duration.months * 30} días`;
  } else {
    const durCode = durationCodeFromSpec(posology.duration);
    const durEntry = findEntry(catalog.durations, durCode ?? undefined);
    if (durEntry) duration = labelFor(durEntry, locale);
    else if (posology.duration?.kind === "CUSTOM") {
      duration = posology.duration.code;
    } else if (posology.duration?.kind === "CONTINUOUS") {
      duration = labelFor(
        findEntry(catalog.durations, "CONTINUOUS") ?? {
          code: "CONTINUOUS",
          labelEs: "Uso continuo",
          labelEn: "Continuous use",
        },
        locale,
      );
    }
  }

  return {
    dosage,
    frequency,
    duration,
    route: posology.route ?? "",
  };
}

/**
 * Best-effort hydrate StructuredPosology from legacy free-text fields.
 * Unmatched values land in CUSTOM / legacyOverride — never invent clinical math.
 */
export function posologyFromLegacyStrings(
  strings: Partial<LegacyPosologyStrings>,
  jurisdictionCode: JurisdictionCode = "CL",
): { posology: StructuredPosology; legacyOverride?: string } {
  const catalog = getCatalog(jurisdictionCode);
  const posology = emptyPosology();
  const leftovers: string[] = [];

  const dosage = strings.dosage?.trim() ?? "";
  if (dosage) {
    const m = dosage.match(
      /^(\d+(?:[.,]\d+)?)\s*(.+)$/i,
    );
    if (m) {
      const amount = Number(m[1]!.replace(",", "."));
      const unitRaw = m[2]!.trim().toLowerCase();
      const unitEntry =
        catalog.doseUnits.find(
          (u) =>
            u.code === unitRaw ||
            u.labelEs.toLowerCase() === unitRaw ||
            u.labelEn.toLowerCase() === unitRaw ||
            `${u.labelEs}s`.toLowerCase() === unitRaw ||
            `${u.labelEn}s`.toLowerCase() === unitRaw,
        ) ?? catalog.doseUnits.find((u) => unitRaw.includes(u.labelEs.toLowerCase()));
      if (Number.isFinite(amount) && unitEntry) {
        posology.dose = { amount, unit: unitEntry.code };
      } else {
        leftovers.push(`dosage:${dosage}`);
      }
    } else {
      leftovers.push(`dosage:${dosage}`);
    }
  }

  const frequency = strings.frequency?.trim() ?? "";
  if (frequency) {
    const byLabel = catalog.frequencies.find(
      (f) =>
        f.labelEs.toLowerCase() === frequency.toLowerCase() ||
        f.labelEn.toLowerCase() === frequency.toLowerCase(),
    );
    const interval = frequency.match(
      /(?:cada|c\/|every)\s*(\d+)\s*(?:h(?:oras?)?|hours?)/i,
    );
    const times = frequency.match(
      /^(\d+)\s*veces?(?:\s*(?:al|\/|por)\s*d[ií]a)?$/i,
    );
    if (byLabel) {
      posology.frequency = frequencySpecFromCode(byLabel.code);
    } else if (interval) {
      posology.frequency = {
        kind: "EVERY_N_HOURS",
        hours: Number(interval[1]),
      };
    } else if (times) {
      posology.frequency = {
        kind: "TIMES_PER_DAY",
        times: Number(times[1]),
      };
    } else {
      posology.frequency = { kind: "CUSTOM", code: frequency };
    }
  }

  const duration = strings.duration?.trim() ?? "";
  if (duration) {
    const byLabel = catalog.durations.find(
      (d) =>
        d.labelEs.toLowerCase() === duration.toLowerCase() ||
        d.labelEn.toLowerCase() === duration.toLowerCase(),
    );
    const days = duration.match(/^(\d+)\s*d[ií]as?/i);
    if (byLabel) {
      posology.duration = durationSpecFromCode(byLabel.code);
    } else if (days) {
      posology.duration = { kind: "N_DAYS", days: Number(days[1]) };
    } else if (/continuo/i.test(duration)) {
      posology.duration = { kind: "CONTINUOUS" };
    } else {
      posology.duration = { kind: "CUSTOM", code: duration };
    }
  }

  const route = strings.route?.trim() ?? "";
  if (route) {
    const routeEntry = catalog.routes.find(
      (r) =>
        r.code === route ||
        r.labelEs.toLowerCase() === route.toLowerCase() ||
        r.labelEn.toLowerCase() === route.toLowerCase(),
    );
    posology.route = routeEntry?.code ?? route;
  }

  return {
    posology,
    legacyOverride: leftovers.length > 0 ? leftovers.join("|") : undefined,
  };
}

export function productFromSelectedMedication(
  line: SelectedMedication,
  jurisdictionCode: JurisdictionCode = "CL",
): MedicationProductRef {
  return {
    drugPresentationId: line.drugPresentationId,
    displayLabel: line.displayLabel,
    innName: line.innName,
    strengthDisplay: line.strengthDisplay,
    doseForm: line.dosageForm,
    routeCode: line.routeCode,
    jurisdictionCode,
  };
}

export function orderLineFromSelectedMedication(
  line: SelectedMedication,
  id: string,
  jurisdictionCode: JurisdictionCode = "CL",
): MedicationOrderLine {
  const { posology, legacyOverride } = posologyFromLegacyStrings(
    {
      dosage: line.dosage,
      frequency: line.frequency,
      duration: line.duration,
      route: line.routeCode ?? line.routeLabel ?? "",
    },
    jurisdictionCode,
  );
  if (line.routeCode && !posology.route) {
    posology.route = line.routeCode;
  }
  return {
    id,
    product: productFromSelectedMedication(line, jurisdictionCode),
    posology,
    patientInstructions: line.instructions.trim() || undefined,
    clinicalNotes: line.observations.trim() || undefined,
    legacyOverride,
  };
}

export function selectedMedicationFromOrderLine(
  line: MedicationOrderLine,
  jurisdictionCode: JurisdictionCode = "CL",
): SelectedMedication {
  const strings = legacyStringsFromPosology(line.posology, jurisdictionCode);
  const base = emptySelectedMedication();
  return {
    ...base,
    drugPresentationId: line.product.drugPresentationId,
    displayLabel: line.product.displayLabel,
    innName: line.product.innName,
    strengthDisplay: line.product.strengthDisplay,
    dosageForm: line.product.doseForm,
    routeCode: line.posology.route ?? line.product.routeCode,
    routeLabel: line.posology.route ?? line.product.routeCode,
    dosage: strings.dosage,
    frequency: strings.frequency,
    duration: strings.duration,
    instructions: line.patientInstructions ?? "",
    observations: line.clinicalNotes ?? "",
  };
}

export function medicationItemFromOrderLine(
  line: MedicationOrderLine,
  jurisdictionCode: JurisdictionCode = "CL",
): MedicationItem {
  const strings = legacyStringsFromPosology(line.posology, jurisdictionCode);
  return {
    name: line.product.displayLabel.trim(),
    drugPresentationId: line.product.drugPresentationId,
    dosage: strings.dosage || undefined,
    frequency: strings.frequency || undefined,
    duration: strings.duration || undefined,
    route: strings.route || undefined,
    instructions: mergeInstructionsAndObservations(
      line.patientInstructions ?? "",
      line.clinicalNotes ?? "",
    ),
  };
}

export function orderLineFromMedicationItem(
  item: MedicationItem,
  id: string,
  jurisdictionCode: JurisdictionCode = "CL",
): MedicationOrderLine {
  const { instructions, observations } = splitInstructionsAndObservations(
    item.instructions ?? "",
  );
  const selected: SelectedMedication = {
    ...emptySelectedMedication(),
    drugPresentationId: item.drugPresentationId,
    displayLabel: item.name ?? "",
    routeCode: item.route,
    routeLabel: item.route,
    dosage: item.dosage ?? "",
    frequency: item.frequency ?? "",
    duration: item.duration ?? "",
    instructions,
    observations,
  };
  return orderLineFromSelectedMedication(selected, id, jurisdictionCode);
}

export function orderLinesFromSelectedMedications(
  lines: SelectedMedication[],
  jurisdictionCode: JurisdictionCode = "CL",
): MedicationOrderLine[] {
  if (!lines.length) {
    return [
      orderLineFromSelectedMedication(
        emptySelectedMedication(),
        "line-0",
        jurisdictionCode,
      ),
    ];
  }
  return lines.map((line, i) =>
    orderLineFromSelectedMedication(line, `line-${i}`, jurisdictionCode),
  );
}

export function selectedMedicationsFromOrderLines(
  lines: MedicationOrderLine[],
  jurisdictionCode: JurisdictionCode = "CL",
): SelectedMedication[] {
  if (!lines.length) return [emptySelectedMedication()];
  return lines.map((line) =>
    selectedMedicationFromOrderLine(line, jurisdictionCode),
  );
}

export { OBS_PREFIX };
