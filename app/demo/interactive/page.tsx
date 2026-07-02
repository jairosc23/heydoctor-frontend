import { DemoClinicalWorkspace } from "@/components/demo/DemoClinicalWorkspace";
import { DemoEvidenceReadinessPanel } from "@/components/demo/DemoEvidenceReadinessPanel";
import { DemoModeSelector } from "@/components/demo/DemoModeSelector";
import { DemoNarrativeRail } from "@/components/demo/DemoNarrativeRail";
import { DemoShell } from "@/components/demo/DemoShell";
import {
  getInteractiveDemoScenario,
  resolveInteractiveDemoMode,
} from "@/lib/demo/interactive-demo-provider";
import type { ReactNode } from "react";

function StoryCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-xl">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function InteractiveDemoPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const mode = resolveInteractiveDemoMode(params?.mode);
  const scenario = await getInteractiveDemoScenario(mode);

  return (
    <DemoShell scenario={scenario}>
      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <DemoNarrativeRail steps={scenario.steps} />

        <div className="space-y-6">
          <DemoModeSelector mode={mode} />

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500 to-slate-900 p-6 shadow-2xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-100">
              Bienvenida
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Una historia clínica interactiva, segura y lista para demo.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-indigo-50">
              {scenario.subtitle}
            </p>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <StoryCard title="Inicio de consulta">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
                  {scenario.patient.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Paciente demo, {scenario.patient.age} años
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {scenario.patient.chiefComplaint}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {scenario.patient.context}
                  </p>
                </div>
              </div>
            </StoryCard>

            <StoryCard title="Workspace clínico simulado">
              <p className="text-sm leading-6 text-slate-600">
                La consulta se compone desde memoria clínica, inteligencia clínica,
                órdenes, nota y Copilot. El workspace permanece read-only tanto en Mock
                Mode como en Live Backend Mode.
              </p>
              <ul className="mt-4 space-y-3">
                {scenario.consultation.timeline.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-700">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </StoryCard>
          </div>

          <DemoClinicalWorkspace scenario={scenario} />

          <DemoEvidenceReadinessPanel scenario={scenario} />

          <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-100 p-6 text-slate-700">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Estado Release Candidate
            </p>
            <p className="mt-2 text-sm leading-6">
              La demo queda lista para revisión: Mock Mode por defecto, Live Backend
              Mode opcional, sin autenticación obligatoria, sin acciones mutables y con
              fallback seguro a datos deterministas.
            </p>
          </section>
        </div>
      </div>
    </DemoShell>
  );
}
