"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalDocumentationPackage } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-documentation-package";
import type { GovernedClinicalDocumentationPackageDocumentPresence } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-documentation-package";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function DocumentPresenceCard({
  doc,
}: {
  doc: GovernedClinicalDocumentationPackageDocumentPresence;
}) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm">
      <p className="text-xs font-medium text-slate-700">{doc.label}</p>
      <p className="mt-1 text-xs text-slate-500">
        Presencia: {doc.present ? "disponible" : "ausente"}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-amber-700">
        READ ONLY · NOT PERSISTED · DRAFT ONLY
      </p>
    </div>
  );
}

export function GovernedClinicalDocumentationPackagePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } =
    useGovernedClinicalDocumentationPackage({
      sessionId,
      enabled: Boolean(sessionId),
    });

  return (
    <div data-testid="governed-clinical-documentation-package-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Documentation Package Gobernado (Fase 17)">
          <p className="mb-3 text-xs text-slate-500">
            Composición de solo lectura de drafts certificados · Sin generación
            de contenido · Sin edición · Sin aprobación · HITL obligatorio · No
            modifica EMR/Workflow.
          </p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">
            READ ONLY · NOT PERSISTED · REQUIRES PHYSICIAN REVIEW · DRAFT ONLY
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
            <div
              className="space-y-3"
              data-testid="governed-clinical-documentation-package"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>
                  Documentos: {result.documents.filter((d) => d.present).length}/
                  {result.documents.length}
                </span>
                <span>·</span>
                <span>
                  Aprobado: {result.governance.draftApproved ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Persistido EMR:{" "}
                  {result.governance.autoPersistedToEmr ? "sí" : "no"}
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
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {result.documents.map((doc) => (
                  <DocumentPresenceCard key={doc.key} doc={doc} />
                ))}
              </div>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
