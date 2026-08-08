/**
 * PosologyRenderer — sole producer of clinical display blocks (ADR-020).
 * Never concatenates dosage + frequency with commas as SSOT.
 */

import {
  findEntry,
  frequencyCodeFromSpec,
  durationCodeFromSpec,
  getCatalog,
  labelFor,
  type CatalogLocale,
} from "../catalogs";
import type {
  JurisdictionCode,
  MedicationOrderLine,
  MedicationProductRef,
  PosologyRenderBlock,
  StructuredPosology,
} from "../types";

export type RenderPosologyInput = {
  product: MedicationProductRef;
  posology: StructuredPosology;
  patientInstructions?: string;
  clinicalNotes?: string;
  jurisdictionCode?: JurisdictionCode;
};

function formatDose(
  posology: StructuredPosology,
  locale: CatalogLocale,
  units: ReturnType<typeof getCatalog>["doseUnits"],
): string | null {
  const dose = posology.dose;
  if (!dose) return null;
  const unitEntry = findEntry(units, dose.unit);
  const unitLabel = unitEntry ? labelFor(unitEntry, locale) : dose.unit;
  const amount =
    dose.amount % 1 === 0 ? String(dose.amount) : String(dose.amount);
  // Pluralization light-touch for es tablet/capsule
  if (locale === "es" && dose.amount !== 1 && unitLabel.endsWith("o")) {
    return `${amount} ${unitLabel}s`;
  }
  if (locale === "en" && dose.amount !== 1 && !unitLabel.endsWith("s")) {
    return `${amount} ${unitLabel}s`;
  }
  return `${amount} ${unitLabel}`;
}

export function renderPosologyBlocks(
  input: RenderPosologyInput,
): PosologyRenderBlock[] {
  const jurisdiction = input.jurisdictionCode ?? input.product.jurisdictionCode ?? "CL";
  const catalog = getCatalog(jurisdiction);
  const { locale } = catalog;
  const blocks: PosologyRenderBlock[] = [];

  const medLabel = locale === "en" ? "Medication" : "Medicamento";
  const presentationLabel = locale === "en" ? "Presentation" : "Presentación";
  const doseLabel = locale === "en" ? "Dose" : "Dosis";
  const freqLabel = locale === "en" ? "Frequency" : "Frecuencia";
  const durLabel = locale === "en" ? "Duration" : "Duración";
  const routeLabel = locale === "en" ? "Route" : "Vía";
  const indLabel = locale === "en" ? "Instructions" : "Indicaciones";
  const obsLabel = locale === "en" ? "Observations" : "Observaciones";

  if (input.product.displayLabel.trim()) {
    blocks.push({
      key: "medication",
      label: medLabel,
      value: input.product.displayLabel.trim(),
    });
  }

  const formCode = input.product.doseForm;
  const formEntry = findEntry(catalog.doseForms, formCode);
  const presentationParts = [
    formEntry ? labelFor(formEntry, locale) : formCode,
    input.product.strengthDisplay,
  ].filter(Boolean);
  if (presentationParts.length > 0) {
    blocks.push({
      key: "presentation",
      label: presentationLabel,
      value: presentationParts.join(" · "),
    });
  }

  const doseText = formatDose(input.posology, locale, catalog.doseUnits);
  if (doseText) {
    blocks.push({ key: "dose", label: doseLabel, value: doseText });
  }

  const freqCode = frequencyCodeFromSpec(input.posology.frequency);
  const freqEntry = findEntry(catalog.frequencies, freqCode ?? undefined);
  if (freqEntry) {
    blocks.push({
      key: "frequency",
      label: freqLabel,
      value: labelFor(freqEntry, locale),
    });
  } else if (input.posology.frequency?.kind === "CUSTOM") {
    blocks.push({
      key: "frequency",
      label: freqLabel,
      value: input.posology.frequency.code,
    });
  }

  const durCode = durationCodeFromSpec(input.posology.duration);
  const durEntry = findEntry(catalog.durations, durCode ?? undefined);
  if (durEntry) {
    blocks.push({
      key: "duration",
      label: durLabel,
      value: labelFor(durEntry, locale),
    });
  } else if (input.posology.duration?.kind === "CUSTOM") {
    blocks.push({
      key: "duration",
      label: durLabel,
      value: input.posology.duration.code,
    });
  }

  const routeEntry = findEntry(catalog.routes, input.posology.route);
  if (routeEntry) {
    blocks.push({
      key: "route",
      label: routeLabel,
      value: labelFor(routeEntry, locale),
    });
  } else if (input.posology.route) {
    blocks.push({
      key: "route",
      label: routeLabel,
      value: input.posology.route,
    });
  }

  const timingLabels = input.posology.timingInstructions
    .map((code) => findEntry(catalog.timingInstructions, code))
    .filter(Boolean)
    .map((e) => labelFor(e!, locale));
  const indications = [
    ...timingLabels,
    input.patientInstructions?.trim(),
  ].filter(Boolean);
  if (indications.length > 0) {
    blocks.push({
      key: "indications",
      label: indLabel,
      value: indications.join(" · "),
    });
  }

  if (input.clinicalNotes?.trim()) {
    blocks.push({
      key: "observations",
      label: obsLabel,
      value: input.clinicalNotes.trim(),
    });
  }

  return blocks;
}

export function renderPosologyBlocksFromLine(
  line: MedicationOrderLine,
  jurisdictionCode?: JurisdictionCode,
): PosologyRenderBlock[] {
  return renderPosologyBlocks({
    product: line.product,
    posology: line.posology,
    patientInstructions: line.patientInstructions,
    clinicalNotes: line.clinicalNotes,
    jurisdictionCode,
  });
}

/**
 * Human-readable multi-line preview for UI.
 * Each clinical field on its own line — never "1, 8 HORAS".
 */
export function formatPosologyPreviewText(
  input: RenderPosologyInput,
): string {
  return renderPosologyBlocks(input)
    .map((b) => `${b.label}: ${b.value}`)
    .join("\n");
}
