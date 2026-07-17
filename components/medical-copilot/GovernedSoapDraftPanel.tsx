"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedSoapDraft } from "@/lib/medical-copilot/clinical-intelligence/governed-soap-draft";
import type { GovernedSoapDraftSection } from "@/lib/medical-copilot/clinical-intelligence/governed-soap-draft";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function SoapSlotCard({
  title,
  section,
}: {
  title: string;
  section: GovernedSoapDraftSection;
}) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm">
      <p className="text-xs font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500">
        Estado: {section.status} · items: {section.items.length}
      </p>
      <p className="text-xs text-slate-500">
        sourceRef: {section.sourceRef ?? "—"}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-amber-700">
        READ ONLY · NOT PERSISTED
      </p>
    </div>
  );
}

export function GovernedSoapDraftPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedSoapDraft({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="governed-soap-draft-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="SOAP Draft Gobernado (Fase 5)">
          <p className="mb-3 text-xs text-slate-500">
            Slots estructurales S/O/A/P · Sin narrativa clínica · Sin diagnóstico
            ni tratamiento · HITL obligatorio · No modifica SOAP/EMR existente.
          </p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">
            READ ONLY · NOT PERSISTED · REQUIRES PHYSICIAN REVIEW
          </p>
          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {result ? (
            <div className="space-y-3" data-testid="governed-soap-draft">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  Revisión médica:{" "}
                  {result.governance.requiresPhysicianReview ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Acciones: {result.governance.executesAction ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  EMR auto:{" "}
                  {result.governance.autoPersistedToEmr ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Draft aprobado:{" "}
                  {result.governance.draftApproved ? "sí" : "no"}
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
                <SoapSlotCard title="Subjective Draft" section={result.subjective} />
                <SoapSlotCard title="Objective Draft" section={result.objective} />
                <SoapSlotCard title="Assessment Draft" section={result.assessment} />
                <SoapSlotCard title="Plan Draft" section={result.plan} />
              </div>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
