"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalIntelligenceRuntime } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-intelligence-runtime";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function packageLabel(value: unknown, key: string): string {
  if (!value || typeof value !== "object") return "—";
  const rec = value as Record<string, unknown>;
  if (typeof rec.source === "string") return rec.source;
  const nested = rec[key];
  if (nested && typeof nested === "object") {
    const inner = nested as Record<string, unknown>;
    if (typeof inner.source === "string") return inner.source;
  }
  return "presente";
}

export function GovernedClinicalIntelligenceRuntimePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } =
    useGovernedClinicalIntelligenceRuntime({
      sessionId,
      enabled: Boolean(sessionId),
    });

  return (
    <div data-testid="governed-clinical-intelligence-runtime-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Intelligence Runtime (Fase 2)">
          <p className="mb-3 text-xs text-slate-500">
            Orquestación de paquetes certificados · HITL obligatorio · No escribe
            EMR · No ejecuta acciones.
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
              data-testid="governed-clinical-intelligence-runtime"
            >
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
              <ul className="space-y-1 text-sm text-slate-700">
                <li>
                  Foundation:{" "}
                  {packageLabel(result.foundation, "governedClinicalIntelligenceFoundation")}
                </li>
                <li>
                  Provider execution:{" "}
                  {packageLabel(result.providerExecution, "providerExecution")}
                </li>
                <li>
                  Processed response:{" "}
                  {packageLabel(result.processedResponse, "processed")}
                </li>
                <li>
                  Clinical output:{" "}
                  {packageLabel(result.clinicalOutput, "output")}
                </li>
                <li>
                  Physician review:{" "}
                  {packageLabel(result.physicianReview, "reviewExperience")}
                </li>
              </ul>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
