import type {
  DemoDataOrigin,
  DemoEvidenceCapability,
  DemoEvidenceStatus,
  DemoScenario,
} from "@/lib/demo/interactive-demo-scenario";

const statusLabel: Record<DemoEvidenceStatus, string> = {
  active: "Active",
  ready: "Ready",
  protected: "Protected",
};

const statusClass: Record<DemoEvidenceStatus, string> = {
  active: "border-primary/20 bg-primaryLight text-primaryDark",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-900",
  protected: "border-amber-200 bg-amber-50 text-amber-900",
};

function DataOriginCard({ item }: { item: DemoDataOrigin }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {item.label}
      </p>
      <p className="mt-2 text-sm font-semibold text-primaryDark">{item.value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
    </div>
  );
}

function CapabilityCard({ item }: { item: DemoEvidenceCapability }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-primaryDark">{item.name}</h3>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass[item.status]}`}
        >
          {statusLabel[item.status]}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.summary}</p>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Evidencia en demo
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{item.evidence}</p>
      </div>
    </article>
  );
}

export function DemoEvidenceReadinessPanel({ scenario }: { scenario: DemoScenario }) {
  const liveLabel = scenario.mode === "live" ? "Backend live: read-only GET" : "Backend live: off";

  return (
    <section
      className="rounded-3xl border border-white/10 bg-white p-4 text-slate-900 shadow-xl sm:p-6"
      aria-labelledby="demo-evidence-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Evidence + Readiness Layer
          </p>
          <h2 id="demo-evidence-title" className="mt-2 text-2xl font-semibold tracking-tight">
            Capacidades Backend Enterprise que respaldan la demo
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Esta capa traduce la arquitectura productiva a evidencia visual para la
            audiencia. En modo live solo usa pruebas GET públicas y conserva la demo
            clínica read-only.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {liveLabel}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {scenario.evidence.dataOrigin.map((item) => (
          <DataOriginCard key={item.label} item={item} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {scenario.evidence.capabilities.map((item) => (
          <CapabilityCard key={item.name} item={item} />
        ))}
      </div>
    </section>
  );
}
