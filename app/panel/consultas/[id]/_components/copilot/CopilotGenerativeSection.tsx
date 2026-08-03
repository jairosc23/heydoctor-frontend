"use client";

import { useCallback, useEffect, useState } from "react";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import {
  getConsultationAssist,
  type ConsultationAssistResponse,
} from "@/lib/clinical-ai-facade";
import {
  mapAssistToGenerativeView,
  type CopilotGenerativeContext,
  type CopilotGenerativeSectionView,
} from "@/lib/copilot-generative-section";
import { cn } from "@/lib/utils";

export type CopilotGenerativeSectionProps = CopilotGenerativeContext & {
  /** Token incrementado por CopilotNavigationContext™ para auto-expandir. */
  expandRequestToken?: number;
};

type GenerativeUiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "success";
      assist: ConsultationAssistResponse;
      view: CopilotGenerativeSectionView;
      requestId: string;
    };

const GOVERNANCE_LINE =
  "No reemplaza juicio clínico profesional. Verificar siempre en consulta.";

export function CopilotGenerativeSection({
  chiefComplaint,
  notes,
  diagnosis,
  treatment,
  expandRequestToken = 0,
}: CopilotGenerativeSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [ui, setUi] = useState<GenerativeUiState>({ status: "idle" });

  useEffect(() => {
    if (expandRequestToken > 0) {
      setExpanded(true);
    }
  }, [expandRequestToken]);

  const runAnalysis = useCallback(async () => {
    setUi({ status: "loading" });
    try {
      const { data, requestId } = await getConsultationAssist({
        chiefComplaint: chiefComplaint?.trim() || undefined,
        notes: notes?.trim() || undefined,
      });
      const view = mapAssistToGenerativeView(data, {
        chiefComplaint,
        notes,
        diagnosis,
        treatment,
      });
      setUi({ status: "success", assist: data, view, requestId });
    } catch (error) {
      setUi({
        status: "error",
        message: toAiClinicalUserMessage(
          error,
          "No se pudo generar el análisis clínico. Inténtalo de nuevo.",
        ),
      });
    }
  }, [chiefComplaint, notes, diagnosis, treatment]);

  return (
    <section
      aria-label="Clinical AI Assistant"
      className="rounded-hd-md border border-indigo-200/70 bg-indigo-50/30"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "clinical-interactive flex w-full items-center gap-hd-2 px-hd-3 py-hd-3 text-left",
          "rounded-hd-md hover:bg-indigo-50/60",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "text-xs text-indigo-700 transition-transform duration-hd-base",
            expanded && "rotate-90",
          )}
        >
          ▸
        </span>
        <span className="min-w-0 flex-1">
          <span className={CLINICAL_SECTION_TITLE}>
            Clinical AI Assistant™
          </span>
          <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
            Análisis generativo bajo demanda — colapsado por defecto
          </span>
        </span>
      </button>

      {expanded ? (
        <div className="space-y-hd-3 border-t border-indigo-200/60 px-hd-3 pb-hd-3 pt-hd-2">
          <p className="rounded-hd-md border border-slate-200/80 bg-white/80 px-hd-3 py-hd-2 text-[11px] leading-snug text-slate-600">
            {GOVERNANCE_LINE}
          </p>

          <button
            type="button"
            onClick={() => void runAnalysis()}
            disabled={ui.status === "loading"}
            className={cn(
              "clinical-interactive w-full rounded-hd-md px-hd-3 py-2 text-xs font-semibold",
              ui.status === "loading"
                ? "cursor-not-allowed bg-slate-300 text-slate-600"
                : "bg-primary text-white hover:bg-primary/90",
            )}
          >
            {ui.status === "loading"
              ? "Generando análisis…"
              : "Generar análisis clínico"}
          </button>

          {ui.status === "loading" ? (
            <div
              role="status"
              aria-live="polite"
              className="space-y-hd-2 rounded-hd-md border border-slate-200/80 bg-white/90 px-hd-3 py-hd-3"
            >
              <div className="flex items-center gap-hd-2">
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
                  aria-hidden
                />
                <p className="text-[11px] text-slate-600">
                  Consultando asistencia clínica generativa…
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="h-2 animate-pulse rounded bg-slate-200/80" />
                <div className="h-2 w-4/5 animate-pulse rounded bg-slate-200/80" />
                <div className="h-2 w-3/5 animate-pulse rounded bg-slate-200/80" />
              </div>
            </div>
          ) : null}

          {ui.status === "error" ? (
            <p
              role="alert"
              className="rounded-hd-md border border-red-200 bg-red-50 px-hd-3 py-hd-2 text-[11px] leading-snug text-red-800"
            >
              {ui.message}
            </p>
          ) : null}

          {ui.status === "success" ? (
            <GenerativeResult assist={ui.assist} view={ui.view} />
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function GenerativeResult({
  assist,
  view,
}: {
  assist: ConsultationAssistResponse;
  view: CopilotGenerativeSectionView;
}) {
  return (
    <div className="space-y-hd-3 rounded-hd-md border border-emerald-200/70 bg-white/95 px-hd-3 py-hd-3">
      {assist.aiRunId ? (
        <p className="font-mono text-[10px] text-slate-500">
          Trazabilidad AI: {assist.aiRunId.slice(0, 8)}…
          {assist.approvalState ? ` · ${assist.approvalState}` : ""}
        </p>
      ) : null}
      {assist.assistiveOnlyNotice ? (
        <p className="rounded-hd-md border border-slate-200/80 bg-slate-50 px-hd-2 py-hd-2 text-[11px] text-slate-600">
          {assist.assistiveOnlyNotice}
        </p>
      ) : null}
      <GenerativeBlock title="Resumen clínico" body={view.clinicalSummary} />
      <GenerativeList
        title="Diagnósticos diferenciales"
        items={view.differentialDiagnoses}
      />
      <GenerativeList title="Conducta sugerida" items={view.suggestedConduct} />
      <GenerativeList
        title="Educación al paciente"
        items={view.patientEducation}
      />
      <GenerativeList title="Seguimiento" items={view.followUp} />
    </div>
  );
}

function GenerativeBlock({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
        {body}
      </p>
    </div>
  );
}

function GenerativeList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-700">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
