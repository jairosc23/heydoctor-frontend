"use client";

import type { ContinuityActiveMedication } from "@/lib/continuity-platform/types";

export function ContinuityActiveSection({
  medications,
  loading,
}: {
  medications: ContinuityActiveMedication[];
  loading?: boolean;
}) {
  return (
    <section data-testid="continuity-active-section" className="space-y-1.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Medicación activa
      </h3>
      {loading ? (
        <p className="text-xs text-slate-400">Cargando…</p>
      ) : medications.length === 0 ? (
        <p className="text-xs text-slate-500">Sin medicación activa registrada.</p>
      ) : (
        <ul className="space-y-1">
          {medications.map((m) => (
            <li
              key={`${m.chainId}:${m.versionId}`}
              className="rounded-md border border-slate-100 bg-white px-2.5 py-1.5 text-xs text-slate-700"
            >
              <span className="font-medium">{m.medicationName}</span>
              {m.dosage ? (
                <span className="text-slate-500"> · {m.dosage}</span>
              ) : null}
              {m.frequency ? (
                <span className="text-slate-500"> · {m.frequency}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
