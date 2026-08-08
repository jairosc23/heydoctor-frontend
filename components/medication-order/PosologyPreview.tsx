"use client";

/**
 * Semantic posology preview — hospital-grade clinical blocks (ADR-020).
 */

import {
  renderPosologyBlocks,
  type JurisdictionCode,
  type MedicationProductRef,
  type StructuredPosology,
} from "@/lib/medication-domain";

export type PosologyPreviewProps = {
  product: MedicationProductRef;
  posology: StructuredPosology;
  patientInstructions?: string;
  clinicalNotes?: string;
  jurisdictionCode?: JurisdictionCode;
};

export function PosologyPreview({
  product,
  posology,
  patientInstructions,
  clinicalNotes,
  jurisdictionCode,
}: PosologyPreviewProps) {
  const blocks = renderPosologyBlocks({
    product,
    posology,
    patientInstructions,
    clinicalNotes,
    jurisdictionCode,
  });

  if (blocks.length === 0) {
    return (
      <div
        className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3"
        data-testid="medication-posology-preview-empty"
      >
        <p className="text-xs font-medium text-slate-500">
          Vista clínica
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Complete presentación, dosis, frecuencia, duración y vía para ver la
          orden estructurada.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-sm"
      data-testid="medication-posology-preview"
    >
      <div className="border-b border-slate-100 bg-teal-700/95 px-4 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-50">
          Orden clínica
        </p>
      </div>
      <dl className="divide-y divide-slate-100">
        {blocks.map((b) => (
          <div
            key={b.key}
            className="grid grid-cols-[8.5rem_1fr] gap-3 px-4 py-2.5"
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {b.label}
            </dt>
            <dd
              className="text-sm font-medium text-slate-900"
              data-testid={`posology-block-${b.key}`}
            >
              {b.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
