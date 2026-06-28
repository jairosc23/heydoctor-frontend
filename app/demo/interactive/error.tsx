'use client';

export default function InteractiveDemoError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <section
        className="max-w-xl rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-xl"
        role="alert"
        aria-labelledby="interactive-demo-error-title"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
          Demo no disponible
        </p>
        <h1 id="interactive-demo-error-title" className="mt-2 text-2xl font-semibold">
          No pudimos preparar la Interactive Demo
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          La demo no ejecutó acciones clínicas ni mutaciones. Puedes reintentar la
          carga; si Live Backend Mode no está disponible, el proveedor vuelve a Mock
          Mode cuando es posible.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Reintentar demo
        </button>
      </section>
    </main>
  );
}
