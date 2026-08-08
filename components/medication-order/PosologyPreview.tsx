"use client";

/**
 * Semantic posology preview — one field per block (ADR-020).
 * Never renders ambiguous "1, 8 HORAS" concatenations.
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
      <p
        className="text-xs text-slate-500"
        data-testid="medication-posology-preview-empty"
      >
        Complete la posología para ver la vista previa clínica.
      </p>
    );
  }

  return (
    <dl
      className="space-y-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
      data-testid="medication-posology-preview"
    >
      {blocks.map((b) => (
        <div key={b.key} className="grid grid-cols-[7rem_1fr] gap-2">
          <dt className="text-xs font-medium text-slate-500">{b.label}</dt>
          <dd className="text-slate-900" data-testid={`posology-block-${b.key}`}>
            {b.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
