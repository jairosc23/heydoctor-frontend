import { DemoCopilotPanel } from "@/components/demo/DemoCopilotPanel";
import type { DemoScenario } from "@/lib/demo/interactive-demo-scenario";
import type { ReactNode } from "react";

function WorkspaceCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {caption ? <p className="mt-1 text-xs text-slate-500">{caption}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ReadOnlyList({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-6 text-slate-700">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primaryLight0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ReadOnlySection({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h4>
      <ReadOnlyList items={items} emptyLabel={emptyLabel} />
    </div>
  );
}

export function DemoClinicalWorkspace({ scenario }: { scenario: DemoScenario }) {
  const { workspace } = scenario;
  const modeLabel =
    scenario.mode === "live" ? "Live checks + demo data" : "Mock deterministic";

  return (
    <section
      className="rounded-3xl border border-white/10 bg-slate-50 p-4 text-slate-900 shadow-xl sm:p-5"
      aria-labelledby="clinical-workspace-title"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Clinical Workspace
          </p>
          <h2 id="clinical-workspace-title" className="mt-2 text-2xl font-semibold tracking-tight">
            Consulta read-only con contexto clínico consolidado
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Datos clínicos de demostración desde el escenario controlado. Sin
            autenticación obligatoria, sin escrituras y sin acciones persistentes.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          {modeLabel}
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <WorkspaceCard
            title="Patient Memory"
            caption="Adaptación read-only del contenido esperado por PatientMemoryCard."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <ReadOnlySection
                title="Condiciones activas"
                items={workspace.memory.activeConditions}
                emptyLabel="Sin condiciones registradas"
              />
              <ReadOnlySection
                title="Medicación actual"
                items={workspace.memory.currentMedications}
                emptyLabel="Sin medicación activa"
              />
              <ReadOnlySection
                title="Laboratorios pendientes"
                items={workspace.memory.pendingLabs}
                emptyLabel="Sin órdenes pendientes"
              />
              <ReadOnlySection
                title="Alertas clínicas"
                items={workspace.memory.alerts}
                emptyLabel="Sin alertas"
              />
            </div>
          </WorkspaceCard>

          <WorkspaceCard
            title="Clinical Intelligence"
            caption="Insights determinísticos y trazables del escenario mock."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <ReadOnlySection
                title="Insights"
                items={workspace.intelligence.insights}
                emptyLabel="Sin insights"
              />
              <ReadOnlySection
                title="Recomendaciones"
                items={workspace.intelligence.recommendations}
                emptyLabel="Sin recomendaciones"
              />
              <ReadOnlySection
                title="Care gaps"
                items={workspace.intelligence.careGaps}
                emptyLabel="Sin brechas"
              />
            </div>
          </WorkspaceCard>

          <WorkspaceCard
            title="Órdenes clínicas"
            caption="Prescripciones, laboratorios y derivaciones bloqueadas en modo lectura."
          >
            <div className="grid gap-5 md:grid-cols-3">
              <ReadOnlySection
                title="Recetas"
                items={workspace.orders.prescriptions}
                emptyLabel="Sin recetas"
              />
              <ReadOnlySection
                title="Laboratorios"
                items={workspace.orders.labs}
                emptyLabel="Sin laboratorios"
              />
              <ReadOnlySection
                title="Derivaciones"
                items={workspace.orders.referrals}
                emptyLabel="Sin derivaciones"
              />
            </div>
          </WorkspaceCard>

          <WorkspaceCard
            title="Nota clínica"
            caption="Vista read-only del contenido que alimentaría ClinicalNoteEditor."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <NoteBlock title="Motivo" value={workspace.clinicalNote.chiefComplaint} />
              <NoteBlock title="Historia actual" value={workspace.clinicalNote.hpi} />
              <NoteBlock title="Evaluación" value={workspace.clinicalNote.assessment} />
              <NoteBlock title="Plan" value={workspace.clinicalNote.plan} />
            </div>
          </WorkspaceCard>
        </div>

        <aside className="space-y-5">
          <WorkspaceCard
            title="Clinical Copilot"
            caption="DemoCopilotPanel con payload mock del escenario."
          >
            <DemoCopilotPanel data={workspace.copilot} />
          </WorkspaceCard>

          <WorkspaceCard title="Timeline de consulta">
            <ReadOnlyList
              items={scenario.consultation.timeline}
              emptyLabel="Sin eventos de consulta"
            />
          </WorkspaceCard>
        </aside>
      </div>
    </section>
  );
}

function NoteBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h4>
      <p className="mt-2 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}
