"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedReferralDraft } from "@/lib/medical-copilot/clinical-intelligence/governed-referral-draft";
import type { GovernedReferralDraftItem } from "@/lib/medical-copilot/clinical-intelligence/governed-referral-draft";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

const SLOT_LABELS: Record<string, string> = {
  specialty_slot: "Specialty Draft",
  priority_slot: "Priority Draft",
  reason_slot: "Reason Draft",
  clinical_summary_slot: "Clinical Summary Draft",
  attached_documents_slot: "Attached Documents Draft",
  destination_slot: "Destination Draft",
};

function SlotCard({ item }: { item: GovernedReferralDraftItem }) {
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

export function GovernedReferralDraftPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedReferralDraft({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="governed-referral-draft-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Referral Draft Gobernado (Fase 8)">
          <p className="mb-3 text-xs text-slate-500">
            Slots estructurales vacíos · Sin derivación real · Sin especialidad ·
            Sin destino · HITL obligatorio · No modifica Referral/EMR.
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
            <div className="space-y-3" data-testid="governed-referral-draft">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Status: {result.referralDraft.status}</span>
                <span>·</span>
                <span>
                  Aprobado: {result.referralDraft.draftApproved ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Persistido: {result.referralDraft.persisted ? "sí" : "no"}
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
                {result.referralDraft.referralItems.map((item) => (
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
