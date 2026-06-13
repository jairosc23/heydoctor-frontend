"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useOptionalClinicalIntelligence } from "@/context/ClinicalIntelligenceContext";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import {
  formatPatientDemographics,
  hashClinicalText,
} from "@/lib/ai-clinical-context";
import { humanizeAiClinicalError } from "@/lib/ai-clinical-errors";
import {
  requestEnrichedClinicalDocumentation,
  type ConsultationSummaryResponse,
} from "@/lib/services/ai-clinical";

const DEBOUNCE_MS = 2500;
const MIN_COOLDOWN_MS = 8000;
const MIN_NOTES_LENGTH = 30;
const MAX_SUGGESTIONS = 2;
const IMPROVED_EXCERPT_MAX = 320;

type Priority = "high" | "consider" | "optional";

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High priority",
  consider: "Consider",
  optional: "Optional",
};

type Suggestion = { id: string; text: string; priority: Priority };

function excerpt(text: string, max = IMPROVED_EXCERPT_MAX): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function buildSuggestions(res: ConsultationSummaryResponse): Suggestion[] {
  const out: Suggestion[] = [];
  const dx = (res.suggestedDiagnosis ?? []).filter((s) => s?.trim());
  if (dx[0]) out.push({ id: "dx0", text: dx[0].trim(), priority: "high" });
  if (dx[1]) out.push({ id: "dx1", text: dx[1].trim(), priority: "consider" });
  if (out.length >= MAX_SUGGESTIONS) return out.slice(0, MAX_SUGGESTIONS);

  const improved = res.improvedNotes?.trim();
  if (improved && out.length < MAX_SUGGESTIONS) {
    const short = excerpt(improved);
    const dup = out.some(
      (o) =>
        short.startsWith(o.text.slice(0, 25)) ||
        o.text.startsWith(short.slice(0, 25)),
    );
    if (!dup) {
      out.push({
        id: "imp",
        text: short,
        priority: out.length === 0 ? "high" : "consider",
      });
    }
  }

  if (out.length < MAX_SUGGESTIONS && res.summary?.trim()) {
    const short = excerpt(res.summary.trim(), 180);
    const dup = out.some(
      (o) => o.text === short || short.includes(o.text.slice(0, 40)),
    );
    if (!dup) {
      out.push({
        id: "sum",
        text: short,
        priority: out.length === 0 ? "consider" : "optional",
      });
    }
  }

  return out.slice(0, MAX_SUGGESTIONS);
}

type Props = {
  consultationId: string;
  patientId?: string | null;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  chiefComplaint?: string;
  treatment?: string;
  diagnosisContext?: string;
  patientAge?: string | number;
  patientSex?: string;
};

export function LiveAiNoteSuggestions({
  consultationId,
  patientId,
  notes,
  setNotes,
  chiefComplaint = "",
  treatment = "",
  diagnosisContext = "",
  patientAge,
  patientSex,
}: Props) {
  const clinicalIntelligence = useOptionalClinicalIntelligence();
  const { data: clinicalMemory } = usePatientClinicalMemory(patientId);
  const debouncedNotes = useDebouncedValue(notes, DEBOUNCE_MS);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [fetching, setFetching] = useState(false);
  const [insertFlash, setInsertFlash] = useState(false);
  const [softNotice, setSoftNotice] = useState<string | null>(null);
  const requestSeq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<{ key: string; items: Suggestion[] } | null>(null);
  const lastSuccessAtRef = useRef(0);
  const cooldownTimerRef = useRef<number | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelectRef = useRef<{ start: number; end: number } | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  const activeDiagnosis = useMemo(() => {
    const ctx = clinicalIntelligence?.diagnosisContext;
    if (ctx?.code) {
      return {
        code: ctx.code,
        description: ctx.description || ctx.code,
      };
    }
    const parsed = diagnosisContext.trim();
    if (!parsed) return null;
    const dash = parsed.indexOf(" — ");
    if (dash > 0) {
      return {
        code: parsed.slice(0, dash).trim(),
        description: parsed.slice(dash + 3).trim(),
      };
    }
    return { code: "", description: parsed };
  }, [clinicalIntelligence?.diagnosisContext, diagnosisContext]);

  const demographics = useMemo(
    () => formatPatientDemographics({ age: patientAge, sex: patientSex }),
    [patientAge, patientSex],
  );

  const insertSuggestion = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      setNotes((prev) => {
        const p = String(prev).trim();
        const next = p ? `${p}\n\n${t}` : t;
        const start = p ? p.length + 2 : 0;
        const end = next.length;
        pendingSelectRef.current = { start, end };
        return next;
      });
    },
    [setNotes],
  );

  useEffect(() => {
    const sel = pendingSelectRef.current;
    const el = taRef.current;
    if (!sel || !el) return;
    pendingSelectRef.current = null;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(sel.start, sel.end);
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      setInsertFlash(true);
      flashTimerRef.current = window.setTimeout(() => {
        setInsertFlash(false);
        flashTimerRef.current = null;
      }, 900);
    });
  }, [notes]);

  useEffect(() => {
    const trimmed = debouncedNotes.trim();
    const consultationKey = consultationId.trim();

    if (!consultationKey || trimmed.length < MIN_NOTES_LENGTH) {
      abortRef.current?.abort();
      setSuggestions([]);
      setFetching(false);
      setSoftNotice(null);
      cacheRef.current = null;
      return;
    }

    const cacheKey = hashClinicalText(
      consultationKey,
      trimmed,
      chiefComplaint,
      treatment,
      activeDiagnosis?.code,
      demographics,
    );

    if (cacheRef.current?.key === cacheKey) {
      setSuggestions(cacheRef.current.items);
      setSoftNotice(null);
      return;
    }

    const runRequest = () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const seq = ++requestSeq.current;
      setFetching(true);
      setSoftNotice(null);

      requestEnrichedClinicalDocumentation({
        consultationId: consultationKey,
        signal: ac.signal,
        patientDemographics: demographics,
        activeDiagnosis,
        chiefComplaint,
        draftNotes: trimmed,
        encounterNotes: trimmed,
        currentConsultationId: consultationKey,
        treatment,
        patientAge,
        patientSex,
        diagnosisText: diagnosisContext || clinicalIntelligence?.diagnosisLabel,
        memory: clinicalMemory.patientId ? clinicalMemory : null,
        cie10CodeId: clinicalIntelligence?.cie10CodeId,
      })
        .then((res) => {
          if (seq !== requestSeq.current || ac.signal.aborted) return;
          const items = buildSuggestions(res);
          cacheRef.current = { key: cacheKey, items };
          lastSuccessAtRef.current = Date.now();
          setSuggestions(items);
          setSoftNotice(null);
        })
        .catch((e: unknown) => {
          if (e instanceof Error && e.name === "AbortError") return;
          if (seq !== requestSeq.current) return;
          if (process.env.NODE_ENV === "development") {
            console.error("[heydoctor][ai-suggestions] fallo", e);
          }
          setSuggestions([]);
          setSoftNotice(humanizeAiClinicalError(e));
        })
        .finally(() => {
          if (seq === requestSeq.current) setFetching(false);
        });
    };

    const elapsed = Date.now() - lastSuccessAtRef.current;
    if (lastSuccessAtRef.current > 0 && elapsed < MIN_COOLDOWN_MS) {
      setSoftNotice("La asistencia clínica se actualizará en unos segundos.");
      if (cooldownTimerRef.current) window.clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = window.setTimeout(() => {
        cooldownTimerRef.current = null;
        runRequest();
      }, MIN_COOLDOWN_MS - elapsed);
      return () => {
        if (cooldownTimerRef.current) {
          window.clearTimeout(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
        }
      };
    }

    runRequest();

    return () => {
      abortRef.current?.abort();
    };
  }, [
    consultationId,
    debouncedNotes,
    chiefComplaint,
    treatment,
    diagnosisContext,
    demographics,
    activeDiagnosis,
    clinicalIntelligence?.cie10CodeId,
    clinicalIntelligence?.diagnosisLabel,
    clinicalMemory,
  ]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      if (cooldownTimerRef.current) window.clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === "Tab" &&
      !e.shiftKey &&
      suggestions.length > 0 &&
      !fetching
    ) {
      e.preventDefault();
      insertSuggestion(suggestions[0].text);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div
        style={{
          borderRadius: 8,
          transition: "box-shadow 0.4s ease, outline 0.4s ease",
          outline: insertFlash ? "2px solid rgba(250, 204, 21, 0.85)" : "none",
          outlineOffset: 2,
          boxShadow: insertFlash
            ? "0 0 0 4px rgba(250, 204, 21, 0.35), 0 0 28px rgba(250, 204, 21, 0.2)"
            : "none",
        }}
      >
        <textarea
          ref={taRef}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Evolución, hallazgos, plan…"
          rows={6}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
            display: "block",
          }}
        />
      </div>

      <p
        style={{
          margin: "6px 0 0",
          fontSize: 10,
          color: "#94a3b8",
        }}
      >
        {suggestions.length > 0 && !fetching
          ? "Tab · insertar sugerencia"
          : "\u00a0"}
      </p>

      {softNotice && !fetching && suggestions.length === 0 ? (
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 11,
            color: "#64748b",
          }}
        >
          {softNotice}
        </p>
      ) : null}

      {(fetching || suggestions.length > 0) && (
        <div
          style={{
            marginTop: 8,
            background: "rgba(255,255,255,0.97)",
            border: "1px solid #dbeafe",
            borderRadius: 10,
            boxShadow: "0 4px 20px rgba(15,23,42,0.08)",
            padding: "8px 10px",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: suggestions.length ? 6 : 0,
            }}
          >
            {fetching && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#38bdf8",
                  animation: "live-ai-pulse 1s ease-in-out infinite",
                }}
              />
            )}
            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>
              {fetching ? "IA…" : "💡 Sugerencias IA"}
            </span>
          </div>
          <style>{`@keyframes live-ai-pulse { 50% { opacity: 0.35; } }`}</style>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {suggestions.map((s) => (
              <li key={s.id} style={{ marginBottom: 6 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color:
                        s.priority === "high"
                          ? "#b45309"
                          : s.priority === "consider"
                            ? "#0369a1"
                            : "#64748b",
                      background:
                        s.priority === "high"
                          ? "#fef3c7"
                          : s.priority === "consider"
                            ? "#e0f2fe"
                            : "#f1f5f9",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {PRIORITY_LABEL[s.priority]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => insertSuggestion(s.text)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    fontSize: 12,
                    lineHeight: 1.4,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #e0f2fe",
                    background: "#f8fafc",
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  + {s.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
