import { DemoClinicalWorkspace } from "@/components/demo/DemoClinicalWorkspace";
import { DemoEvidenceReadinessPanel } from "@/components/demo/DemoEvidenceReadinessPanel";
import { DemoModeSelector } from "@/components/demo/DemoModeSelector";
import { DemoNarrativeRail } from "@/components/demo/DemoNarrativeRail";
import { DemoShell } from "@/components/demo/DemoShell";
import {
  getInteractiveDemoScenario,
  resolveInteractiveDemoMode,
} from "@/lib/demo/interactive-demo-provider";

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
      <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <DemoNarrativeRail steps={scenario.steps} />

        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em] text-primaryMid"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Demo clínica
              </p>
              <h2
                className="mt-2 text-2xl font-bold tracking-tight text-primaryDark sm:text-3xl"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {scenario.patient.chiefComplaint}
              </h2>
              <p className="mt-2 text-sm leading-6 text-primaryDark/70 sm:text-base">
                {scenario.subtitle}
              </p>
            </div>
            <DemoModeSelector mode={mode} />
          </div>

          <section className="border-b border-hd-border-subtle pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {scenario.patient.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-primaryDark/60">
                  Paciente demo · {scenario.patient.age} años
                </p>
                <p className="mt-1 text-sm leading-6 text-primaryDark/80">
                  {scenario.patient.context}
                </p>
              </div>
            </div>
          </section>

          <DemoClinicalWorkspace scenario={scenario} />

          <DemoEvidenceReadinessPanel scenario={scenario} />

          <p className="text-xs leading-5 text-primaryDark/55">
            Modo demostración: lectura únicamente. Mock por defecto; Live Backend
            opcional. Sin acciones mutables.
          </p>
        </div>
      </div>
    </DemoShell>
  );
}
