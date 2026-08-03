"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedMedicalLeaveDraft } from "@/lib/medical-copilot/clinical-intelligence/governed-medical-leave-draft";
import type { GovernedMedicalLeaveDraftItem } from "@/lib/medical-copilot/clinical-intelligence/governed-medical-leave-draft";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

const SLOT_LABELS: Record<string, string> = {
  leave_type_slot: "Leave Type Draft",
  diagnosis_reference_slot: "Diagnosis Reference Draft",
  start_date_slot: "Start Date Draft",
  end_date_slot: "End Date Draft",
  duration_slot: "Duration Draft",
  work_restrictions_slot: "Work Restrictions Draft",
};

function SlotCard({ item }: { item: GovernedMedicalLeaveDraftItem }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm">
      <p className="text-xs font-medium text-slate-700">
        {SLOT_LABELS[item.slotKey] ?? item.slotKey}
      </p>
      <p className="mt-1 text-xs text-slate-500">Estado: {item.status}</p>
      <p className="text-xs text-slate-500">Valor: vacío</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-amber-700">
        READ ONLY · NOT PERSISTED · DRAFT ONLY
      </p>
    </div>
  );
}

export function GovernedMedicalLeaveDraftPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedMedicalLeaveDraft({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="governed-medical-leave-draft-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Medical Leave Draft Gobernado (Fase 10)">
          <p className="mb-3 text-xs text-slate-500">
            Slots estructurales vacíos · Sin licencia real · Sin firma · Sin PDF
            · HITL obligatorio · No modifica licencias/EMR.
          </p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">
            READ ONLY · NOT PERSISTED · REQUIRES PHYSICIAN REVIEW · DRAFT ONLY
          </p>
          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {result ? (
            <div
              className="space-y-3"
              data-testid="governed-medical-leave-draft"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Status: {result.medicalLeaveDraft.status}</span>
                <span>·</span>
                <span>
                  Aprobado:{" "}
                  {result.medicalLeaveDraft.draftApproved ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Persistido:{" "}
                  {result.medicalLeaveDraft.persisted ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Revisión médica:{" "}
                  {result.governance.requiresPhysicianReview ? "sí" : "no"}
                </span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>
              {result.reason ? (
                <p className="text-xs text-slate-500">reason: {result.reason}</p>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-2">
                {result.medicalLeaveDraft.medicalLeaveItems.map((item) => (
                  <SlotCard key={item.slotKey} item={item} />
                ))}
              </div>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
