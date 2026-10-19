"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalCalculationSystemPackage } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-calculation-system-package";
import type { GovernedClinicalCalculationSystemPackageEntryView } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-calculation-system-package";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function EntryCard({ entry }: { entry: GovernedClinicalCalculationSystemPackageEntryView }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm" data-testid="clinical-calculation-system-entry">
      <p className="text-xs font-medium text-slate-800">{entry.entryTitle}</p>
      <p className="mt-1 text-[11px] text-slate-500">formula: {entry.formulaId || "—"} · result: {entry.resultValue ?? "—"} {entry.resultUnit || ""}</p>
      <p className="mt-2 text-xs text-slate-600"><span className="font-medium">Resumen:</span> {entry.summary || "—"}</p>
      <p className="mt-1 text-xs text-slate-600"><span className="font-medium">Explicación:</span> {entry.explanation || "—"}</p>
      <p className="mt-1 text-xs text-slate-600"><span className="font-medium">Aplicabilidad:</span> {entry.applicability} · confianza {entry.confidence}</p>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-amber-700">HITL · CALCULATION SYSTEM · NO LLM · NO EMR</p>
    </div>
  );
}

export function GovernedClinicalCalculationSystemPackagePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedClinicalCalculationSystemPackage({ sessionId, enabled: Boolean(sessionId) });
  return (
    <div data-testid="governed-clinical-calculation-system-package-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title={"Clinical Calculation Package"}>
          <p className="mb-3 text-xs text-slate-500">Superficie determinística · explicable · auditable · HITL · sin execute · sin persist · sin approve · sin LLM</p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">READ ONLY · HITL · usesLlm=false · executesAction=false · writesEmr=false · repositoryInvoked=false · automaticDecision=false</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión HeyDoctor Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {result ? (
            <div className="space-y-3" data-testid="governed-clinical-calculation-system-package">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {result.status ?? "—"}</span><span>·</span>
                <span>Aplicables: {result.applicableCount}</span><span>·</span>
                <span>Entradas: {result.entries.length}</span>
                {result.enginesPresent.length ? (<><span>·</span><span>Motores: {result.enginesPresent.length}</span></>) : null}
                <span>·</span><span>EMR: no</span>
                <button type="button" onClick={refresh} className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700">Actualizar</button>
              </div>
              {result.reason ? <p className="text-xs text-slate-500">reason: {result.reason}</p> : null}
              {result.entries.length === 0 ? <p className="text-sm text-slate-500">Sin entradas en esta superficie.</p> : (
                <div className="grid gap-2 lg:grid-cols-2">
                  {result.entries.slice(0, 12).map((entry) => (
                    <EntryCard key={entry.entryId + entry.applicability} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
