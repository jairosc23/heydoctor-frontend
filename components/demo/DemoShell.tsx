import type { ReactNode } from "react";
import type { DemoScenario, DemoSignal } from "@/lib/demo/interactive-demo-scenario";

const toneClass: Record<DemoSignal["tone"], string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-900",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

function SignalBadge({ signal }: { signal: DemoSignal }) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2 ${toneClass[signal.tone]}`}
      aria-label={`${signal.label}: ${signal.value}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-75">
        {signal.label}
      </p>
      <p className="text-sm font-semibold">{signal.value}</p>
    </div>
  );
}

export function DemoShell({
  scenario,
  children,
}: {
  scenario: DemoScenario;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <a
        href="#demo-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
      >
        Saltar al contenido de la demo
      </a>
      <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
              HeyDoctor
            </p>
            <h1 className="mt-1 text-xl font-semibold text-white">{scenario.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {scenario.signals.map((signal) => (
              <SignalBadge key={signal.label} signal={signal} />
            ))}
          </div>
        </div>
      </div>

      <div id="demo-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8">
        {children}
      </div>
    </main>
  );
}
