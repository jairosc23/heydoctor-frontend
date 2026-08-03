import type { ReactNode } from "react";
import Link from "next/link";
import type { DemoScenario, DemoSignal } from "@/lib/demo/interactive-demo-scenario";
import { BrandLogo } from "@/components/branding";

const toneClass: Record<DemoSignal["tone"], string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  indigo: "border-primary/20 bg-primaryLight text-primaryDark",
  slate: "border-hd-border-subtle bg-hd-surface-muted text-primaryDark",
};

function SignalBadge({ signal }: { signal: DemoSignal }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${toneClass[signal.tone]}`}
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
    <main className="min-h-screen bg-hd-surface-base text-primaryDark">
      <a
        href="#demo-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-hd-surface-chrome focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primaryDark focus:ring-2 focus:ring-primary"
      >
        Saltar al contenido de la demo
      </a>
      <div className="sticky top-0 z-40 border-b border-hd-border-subtle bg-hd-surface-chrome">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="no-underline">
              <BrandLogo variant="nav" priority />
            </Link>
            <div className="min-w-0 border-l border-hd-border-default pl-3">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Demo
              </p>
              <h1
                className="mt-0.5 truncate text-base font-semibold text-primaryDark"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                {scenario.title}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {scenario.signals.slice(0, 3).map((signal) => (
              <SignalBadge key={signal.label} signal={signal} />
            ))}
          </div>
        </div>
      </div>

      <div id="demo-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-5 sm:py-10">
        {children}
      </div>
    </main>
  );
}
