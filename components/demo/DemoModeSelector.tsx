import Link from "next/link";
import type { InteractiveDemoMode } from "@/lib/demo/interactive-demo-provider";

const modeClass: Record<InteractiveDemoMode, string> = {
  mock: "border-primary/20 bg-primaryLight text-primaryDark",
  live: "border-primaryMid/30 bg-hd-surface-muted text-primaryMid",
};

export function DemoModeSelector({ mode }: { mode: InteractiveDemoMode }) {
  return (
    <section
      className="rounded-2xl border border-hd-border-subtle bg-hd-surface-chrome p-4 text-primaryDark shadow-premium"
      aria-labelledby="demo-provider-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p
            id="demo-provider-title"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-primaryDark/60"
          >
            Data Provider
          </p>
          <p className="mt-1 text-sm text-primaryDark/70">
            Mock es el comportamiento por defecto. Live solo ejecuta GET públicos y
            vuelve a mock si el backend no está disponible.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Cambiar modo de datos demo">
          <Link
            href="/demo/interactive"
            aria-current={mode === "mock" ? "page" : undefined}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              mode === "mock"
                ? modeClass.mock
                : "border-hd-border-default bg-hd-surface-muted text-primaryDark/70"
            } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
          >
            Mock Mode
          </Link>
          <Link
            href="/demo/interactive?mode=live"
            aria-current={mode === "live" ? "page" : undefined}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              mode === "live"
                ? modeClass.live
                : "border-hd-border-default bg-hd-surface-muted text-primaryDark/70"
            } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
          >
            Live Backend Mode
          </Link>
        </nav>
      </div>
    </section>
  );
}
