"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getConsultationAssist } from "@/lib/clinical-ai-facade";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { mapAssistToLiveClinicalInsights } from "@/lib/epic3/live-clinical-insights";
import {
  CIC_ASSIST_MODE_HINTS,
  CIC_ASSIST_MODE_LABELS,
  CIC_AUTHORITY,
  CIC_MAX_VISIBLE_PROPOSALS,
  ENCOUNTER_CIC_ID,
  applyCicProposalToSoap,
  buildCicAssistNotes,
  capCicProposals,
  cicProposalTargetForMode,
  isForbiddenCicProposal,
  resolveCicAssistMode,
  type CicEncounterContext,
  type CicProposal,
} from "../encounter-copilot-cic";

export function EncounterCopilotCicStrip({
  consultationId,
  chiefComplaint,
  subjective,
  plan,
  physicalExamDocumented = false,
  antecedentsDocumented = false,
  activeProblemCount = 0,
  offerExpanded = false,
  onApplyToSubjective,
  onApplyToPlan,
  editable,
}: {
  consultationId?: string | null;
  chiefComplaint?: string | null;
  subjective: string;
  plan: string;
  physicalExamDocumented?: boolean;
  antecedentsDocumented?: boolean;
  activeProblemCount?: number;
  offerExpanded?: boolean;
  onApplyToSubjective: (next: string) => void;
  onApplyToPlan?: (next: string) => void;
  editable: boolean;
}) {
  const previousActiveProblemCount = useRef<number | null>(null);

  const context = useMemo<CicEncounterContext>(
    () => ({
      chiefComplaint: chiefComplaint ?? "",
      subjective,
      plan,
      physicalExamDocumented,
      antecedentsDocumented,
      activeProblemCount,
      previousActiveProblemCount: previousActiveProblemCount.current,
      offerExpanded,
    }),
    [
      activeProblemCount,
      antecedentsDocumented,
      chiefComplaint,
      offerExpanded,
      physicalExamDocumented,
      plan,
      subjective,
    ],
  );
  const mode = resolveCicAssistMode(context);

  useEffect(() => {
    previousActiveProblemCount.current = activeProblemCount;
  }, [activeProblemCount]);
  const [proposals, setProposals] = useState<CicProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProposals([]);
    setError(null);
  }, [mode]);

  const suggest = useCallback(async () => {
    if (!editable) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getConsultationAssist({
        chiefComplaint: context.chiefComplaint.trim().slice(0, 2000) || undefined,
        notes: buildCicAssistNotes(mode, context),
      });
      const target = cicProposalTargetForMode(mode);
      const batch = mapAssistToLiveClinicalInsights({
        sessionId: consultationId ? `cic:${consultationId}` : "cic:local",
        aiRunId: data.aiRunId ?? null,
        promptVersion: data.promptVersion ?? null,
        assistiveOnlyNotice: data.assistiveOnlyNotice ?? null,
        recommendations: data.recommendations ?? [],
      });
      const next = capCicProposals(
        batch.insights
          .filter((item) => !isForbiddenCicProposal(item.text))
          .map((item) => ({
            id: item.id,
            text: item.text,
            target,
          })),
      );
      setProposals(next);
      if (next.length === 0) {
        setError("El Copilot no tiene una propuesta útil ahora. Puede reintentar.");
      }
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No se pudieron generar propuestas. Siga documentando SOAP.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [consultationId, context, editable, mode]);

  const apply = (proposal: CicProposal) => {
    if (!editable) return;
    if (proposal.target === "soap_plan") {
      onApplyToPlan?.(applyCicProposalToSoap(plan, proposal.text));
    } else {
      onApplyToSubjective(applyCicProposalToSoap(subjective, proposal.text));
    }
    setProposals((current) =>
      current.filter((item) => item.id !== proposal.id),
    );
  };

  const dismiss = (id: string) => {
    setProposals((current) => current.filter((item) => item.id !== id));
  };

  return (
    <section
      id={ENCOUNTER_CIC_ID}
      data-testid="encounter-cic"
      data-hot-path="true"
      data-cic-authority="propose"
      data-cic-confirm={String(CIC_AUTHORITY.confirm)}
      data-cic-emit={String(CIC_AUTHORITY.emit)}
      data-cic-decide={String(CIC_AUTHORITY.decide)}
      data-cic-persist={String(CIC_AUTHORITY.persist)}
      data-cic-mode={mode}
      data-cic-guidance="continuous"
      className="rounded-hd-md border border-primary/20 bg-primaryLight/15 px-hd-3 py-hd-3"
      aria-label="HeyDoctor Copilot · CIC del encuentro"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/80">
            HeyDoctor Copilot · CIC
          </p>
          <p
            className="mt-0.5 text-[12px] font-semibold text-slate-900"
            aria-live="polite"
            data-testid="encounter-cic-mode-label"
          >
            {CIC_ASSIST_MODE_LABELS[mode]}
          </p>
          <p
            className="mt-0.5 text-[11px] text-slate-600"
            data-testid="encounter-cic-mode-hint"
          >
            {CIC_ASSIST_MODE_HINTS[mode]}
          </p>
        </div>
        {editable ? (
          <button
            type="button"
            data-testid="encounter-cic-suggest"
            data-cic-action="suggest"
            onClick={() => void suggest()}
            disabled={loading}
            className="clinical-interactive shrink-0 rounded-hd-md border border-primary/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primaryLight disabled:opacity-50"
          >
            {loading ? "Proponiendo…" : "Sugerir"}
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-[11px] text-rose-700">
          {error}
        </p>
      ) : null}

      {proposals.length > 0 ? (
        <ul className="mt-2 space-y-2" data-testid="encounter-cic-proposals">
          {proposals.slice(0, CIC_MAX_VISIBLE_PROPOSALS).map((proposal) => (
            <li
              key={proposal.id}
              data-testid={`encounter-cic-proposal-${proposal.id}`}
              className="rounded-hd-md border border-hd-border-subtle bg-white px-hd-3 py-hd-2"
            >
              <p className="text-[12px] text-slate-800">{proposal.text}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  data-testid={`encounter-cic-apply-${proposal.id}`}
                  data-cic-action={
                    proposal.target === "soap_plan" ? "apply_plan" : "apply_soap"
                  }
                  onClick={() => apply(proposal)}
                  disabled={!editable}
                  className="clinical-interactive rounded-hd-md bg-primary px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                >
                  {proposal.target === "soap_plan"
                    ? "Aplicar al plan"
                    : "Aplicar a SOAP"}
                </button>
                <button
                  type="button"
                  data-testid={`encounter-cic-dismiss-${proposal.id}`}
                  data-cic-action="dismiss"
                  onClick={() => dismiss(proposal.id)}
                  className="clinical-interactive rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted px-2 py-1 text-[11px] font-medium text-slate-700"
                >
                  Descartar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
