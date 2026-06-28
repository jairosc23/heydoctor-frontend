import type { DemoStep, DemoStepKey } from '../../lib/demo/interactive-demo-scenario';

const activeStep: DemoStepKey = 'welcome';

function stepClass(isActive: boolean): string {
  return isActive
    ? 'border-indigo-200 bg-indigo-50 text-indigo-950'
    : 'border-slate-200 bg-white text-slate-700';
}

export function DemoNarrativeRail({ steps }: { steps: DemoStep[] }) {
  return (
    <aside
      className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
      aria-labelledby="demo-narrative-title"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Recorrido guiado
      </p>
      <h2 id="demo-narrative-title" className="mt-2 text-lg font-semibold text-slate-950">
        Historia clínica demo
      </h2>
      <ol className="mt-4 space-y-3">
        {steps.map((step) => {
          const isActive = step.key === activeStep;
          return (
            <li
              key={step.key}
              className={`rounded-2xl border p-4 transition ${stepClass(isActive)}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {step.eyebrow}
                </span>
                {isActive && (
                  <span
                    className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                    aria-label="Paso inicial activo"
                  >
                    Activo
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">{step.description}</p>
              <p className="mt-2 text-xs font-medium text-slate-500">{step.outcome}</p>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
