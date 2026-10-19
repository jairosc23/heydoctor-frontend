"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type {
  PersistencePreviewBlock,
  PersistencePreviewPayload,
} from "@/lib/epic3/persistence-preview";
import { cn } from "@/lib/utils";

function decisionLabel(decision: PersistencePreviewBlock["decision"]): string {
  switch (decision) {
    case "accepted":
      return "Aceptado";
    case "edited":
      return "Editado";
    case "discarded":
      return "Descartado";
    default:
      return "Pendiente";
  }
}

function decisionTone(decision: PersistencePreviewBlock["decision"]): string {
  switch (decision) {
    case "accepted":
      return "border-emerald-200 bg-emerald-50/80 text-emerald-900";
    case "edited":
      return "border-sky-200 bg-sky-50/80 text-sky-900";
    case "discarded":
      return "border-slate-200 bg-slate-100 text-slate-500";
    default:
      return "border-amber-200 bg-amber-50/70 text-amber-900";
  }
}

function BlockRow({ block }: { block: PersistencePreviewBlock }) {
  return (
    <li
      data-testid={`persistence-preview-block-${block.id}`}
      className={cn(
        "rounded-hd-md border px-hd-2 py-hd-2 text-[11px]",
        decisionTone(block.decision),
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <p className="font-semibold">
          {block.label} · {block.sourceUc} · {decisionLabel(block.decision)}
        </p>
        <p className="font-mono text-[10px] opacity-80">
          {block.includedInPersistencePayload ? "en payload" : "excluido"}
        </p>
      </div>
      <p className="mt-1 leading-snug text-slate-800">{block.text}</p>
      <dl className="mt-1 grid gap-0.5 font-mono text-[10px] text-slate-500">
        <div>aiRunId: {block.aiRunId ?? "(n/d)"}</div>
        <div>promptVersion: {block.promptVersion ?? "(n/d)"}</div>
        <div>
          provenance: {block.provenance.origin}/{block.provenance.kind}
          {block.provenance.foundationProvenanceIds.length > 0
            ? ` · foundation[${block.provenance.foundationProvenanceIds.join(",")}]`
            : ""}
        </div>
      </dl>
    </li>
  );
}

export function CopilotPersistencePreview({
  preview,
}: {
  preview: PersistencePreviewPayload;
}) {
  const candidateJson = JSON.stringify(preview.persistenceCandidate, null, 2);

  return (
    <section
      aria-label="Persistence Preview"
      data-testid="copilot-persistence-preview"
      className="space-y-hd-3 rounded-hd-md border border-violet-200/70 bg-violet-50/40 px-hd-3 py-hd-3"
    >
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-900/80">
          EPIC-3 · Close · Preview H3 (no ejecución)
        </p>
        <h3 className={CLINICAL_SECTION_TITLE}>
          Governed Persistence Preview
        </h3>
        <p className="text-[11px] text-slate-600">
          Payload estructurado desde bloques UC-04B aceptados/editados.
          Solo preview · H2 no ejecutado · H3 no ejecutado · sin EMR.
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-600 sm:grid-cols-3">
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">Aceptados</dt>
            <dd>{preview.summary.accepted}</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">Editados</dt>
            <dd>{preview.summary.edited}</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">Descartados</dt>
            <dd>{preview.summary.discarded}</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">Pendientes</dt>
            <dd>{preview.summary.pending}</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">En payload</dt>
            <dd>{preview.summary.selectedForPersistence}</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">Acción</dt>
            <dd>{preview.requestedAction}</dd>
          </div>
        </dl>
        <p className="font-mono text-[10px] text-slate-500">
          HITL: H1({preview.hitl.h1ReviewAi}) → H2({preview.hitl.h2Status}) →
          H3({preview.hitl.h3Status})
        </p>
      </header>

      {preview.blocks.length === 0 ? (
        <p className="text-[11px] text-slate-500">
          No hay bloques de revisión en sesión para componer el preview.
        </p>
      ) : (
        <ul className="space-y-hd-2">
          {preview.blocks.map((block) => (
            <BlockRow key={block.id} block={block} />
          ))}
        </ul>
      )}

      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Resumen payload candidato (H3)
        </p>
        <pre
          data-testid="persistence-preview-candidate-json"
          className="max-h-48 overflow-auto rounded-hd-md border border-hd-border-subtle bg-white/90 p-hd-2 font-mono text-[10px] leading-relaxed text-slate-700"
        >
          {candidateJson}
        </pre>
      </div>

      <p className="font-mono text-[10px] text-slate-400">
        previewId: {preview.previewId} · persistsToEmr: false ·
        writeExecuted: false
      </p>
    </section>
  );
}
