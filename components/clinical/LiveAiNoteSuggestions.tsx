"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import {
  postConsultationSummary,
  type ConsultationSummaryResponse,
  type ConsultationSummaryRequest,
} from "@/lib/services/ai-clinical";

const DEBOUNCE_MS = 700;
const MIN_NOTES_LENGTH = 30;
const MAX_SUGGESTIONS = 2;
const PRIOR_TAIL_MAX = 300;

type Priority = "high" | "consider" | "optional";

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High priority",
  consider: "Consider",
  optional: "Optional",
};

type Suggestion = { id: string; text: string; priority: Priority };

function buildSuggestions(res: ConsultationSummaryResponse): Suggestion[] {
  const out: Suggestion[] = [];
  const dx = (res.suggestedDiagnosis ?? []).filter((s) => s?.trim());
  if (dx[0]) out.push({ id: "dx0", text: dx[0].trim(), priority: "high" });
  if (dx[1]) out.push({ id: "dx1", text: dx[1].trim(), priority: "consider" });
  if (out.length >= MAX_SUGGESTIONS) return out.slice(0, MAX_SUGGESTIONS);

  const improved = res.improvedNotes?.trim();
  if (improved && out.length < MAX_SUGGESTIONS) {
    const short =
      improved.length > 180 ? `${improved.slice(0, 177).trim()}…` : improved;
    const dup = out.some(
      (o) =>
        short.startsWith(o.text.slice(0, 25)) ||
        o.text.startsWith(short.slice(0, 25))
    );
    if (!dup)
      out.push({
        id: "imp",
        text: short,
        priority: out.length === 0 ? "high" : "consider",
      });
  }

  if (out.length < MAX_SUGGESTIONS && res.summary?.trim()) {
    const s = res.summary.trim();
    const short = s.length > 180 ? `${s.slice(0, 177).trim()}…` : s;
    const dup = out.some(
      (o) => o.text === short || short.includes(o.text.slice(0, 40))
    );
    if (!dup)
      out.push({
        id: "sum",
        text: short,
        priority: out.length === 0 ? "consider" : "optional",
      });
  }

  return out.slice(0, MAX_SUGGESTIONS);
}

function buildRequestPayload(
  trimmed: string,
  diagnosis: string,
  patientAge?: string | number,
  patientSex?: string
): ConsultationSummaryRequest {
  const tailLen = Math.min(PRIOR_TAIL_MAX, trimmed.length);
  const priorNotesExcerpt =
    tailLen > 0 ? trimmed.slice(-tailLen) : undefined;

  const ageStr =
    patientAge !== undefined &&
    patientAge !== null &&
    String(patientAge).trim()
      ? String(patientAge).trim()
      : undefined;
  const sexStr = patientSex?.trim() || undefined;

  return {
    reason: "",
    notes: trimmed,
    diagnosis: diagnosis.trim(),
    treatment: "",
    ...(ageStr ? { patientAge: ageStr } : {}),
    ...(sexStr ? { patientSex: sexStr } : {}),
    ...(priorNotesExcerpt ? { priorNotesExcerpt } : {}),
  };
}

function cacheKeyForPayload(
  trimmed: string,
  diagnosis: string,
  patientAge?: string | number,
  patientSex?: string
): string {
  const body = buildRequestPayload(trimmed, diagnosis, patientAge, patientSex);
  return JSON.stringify(body);
}

type Props = {
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  diagnosisContext?: string;
  patientAge?: string | number;
  patientSex?: string;
};

export function LiveAiNoteSuggestions({
  notes,
  setNotes,
  diagnosisContext = "",
  patientAge,
  patientSex,
}: Props) {
  const debouncedNotes = useDebouncedValue(notes, DEBOUNCE_MS);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [fetching, setFetching] = useState(false);
  const [insertFlash, setInsertFlash] = useState(false);
  const requestSeq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<{ key: string; items: Suggestion[] } | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelectRef = useRef<{ start: number; end: number } | null>(null);
  const flashTimerRef = useRef<number | null>(null);

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
    [setNotes]
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

    if (trimmed.length < MIN_NOTES_LENGTH) {
      abortRef.current?.abort();
      setSuggestions([]);
      setFetching(false);
      cacheRef.current = null;
      return;
    }

    const key = cacheKeyForPayload(
      trimmed,
      diagnosisContext,
      patientAge,
      patientSex
    );
    if (cacheRef.current?.key === key) {
      setSuggestions(cacheRef.current.items);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const seq = ++requestSeq.current;
    setFetching(true);

    postConsultationSummary(
      buildRequestPayload(trimmed, diagnosisContext, patientAge, patientSex),
      ac.signal
    )
      .then((res) => {
        if (seq !== requestSeq.current || ac.signal.aborted) return;
        const items = buildSuggestions(res);
        cacheRef.current = { key, items };
        setSuggestions(items);
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === "AbortError") return;
        if (seq !== requestSeq.current) return;
        setSuggestions([]);
      })
      .finally(() => {
        if (seq === requestSeq.current) setFetching(false);
      });
  }, [debouncedNotes, diagnosisContext, patientAge, patientSex]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
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
    <div
      style={{
        position: "relative",
        paddingBottom: fetching || suggestions.length > 0 ? 96 : 0,
        transition: "padding-bottom 0.2s ease",
      }}
    >
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
          ? "Tab · insertar 1.ª sugerencia"
          : "\u00a0"}
      </p>

      {(fetching || suggestions.length > 0) && (
        <div
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            top: "100%",
            marginTop: 6,
            zIndex: 5,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
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
                {fetching ? "IA…" : "Sugerencias"}
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
        </div>
      )}
    </div>
  );
}
