import Link from "next/link";
import type { InteractiveDemoMode } from "@/lib/demo/interactive-demo-provider";

const modeClass: Record<InteractiveDemoMode, string> = {
  mock: "border-indigo-200 bg-indigo-50 text-indigo-900",
  live: "border-emerald-200 bg-emerald-50 text-emerald-900",
};

export function DemoModeSelector({ mode }: { mode: InteractiveDemoMode }) {
  return (
    <section
      className="rounded-3xl border border-white/10 bg-white p-4 text-slate-900 shadow-xl"
      aria-labelledby="demo-provider-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p
            id="demo-provider-title"
            className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
          >
            Data Provider
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Mock es el comportamiento por defecto. Live solo ejecuta GET públicos y
            vuelve a mock si el backend no está disponible.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Cambiar modo de datos demo">
          <Link
            href="/demo/interactive"
            aria-current={mode === "mock" ? "page" : undefined}
            className={`rounded-full border px-3 py-2 text-sm font-semibold ${
              mode === "mock" ? modeClass.mock : "border-slate-200 bg-slate-50 text-slate-600"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
          >
            Mock Mode
          </Link>
          <Link
            href="/demo/interactive?mode=live"
            aria-current={mode === "live" ? "page" : undefined}
            className={`rounded-full border px-3 py-2 text-sm font-semibold ${
              mode === "live" ? modeClass.live : "border-slate-200 bg-slate-50 text-slate-600"
            } focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
          >
            Live Backend Mode
          </Link>
        </nav>
      </div>
    </section>
  );
}
