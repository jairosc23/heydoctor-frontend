import type { DemoStep, DemoStepKey } from "@/lib/demo/interactive-demo-scenario";

const activeStep: DemoStepKey = "welcome";

function stepClass(isActive: boolean): string {
  return isActive
    ? "border-primary/20 bg-primaryLight text-primaryDark"
    : "border-hd-border-subtle bg-hd-surface-chrome text-primaryDark";
}

export function DemoNarrativeRail({ steps }: { steps: DemoStep[] }) {
  return (
    <aside
      className="rounded-2xl border border-hd-border-subtle bg-hd-surface-chrome p-5 shadow-premium lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
      aria-labelledby="demo-narrative-title"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primaryDark/60">
        Recorrido guiado
      </p>
      <h2
        id="demo-narrative-title"
        className="mt-2 text-lg font-semibold text-primary"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
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
                    className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                    aria-label="Paso inicial activo"
                  >
                    Activo
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
              <p className="mt-1 text-xs leading-5 text-primaryDark/70">{step.description}</p>
              <p className="mt-2 text-xs font-medium text-primaryDark/60">{step.outcome}</p>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
