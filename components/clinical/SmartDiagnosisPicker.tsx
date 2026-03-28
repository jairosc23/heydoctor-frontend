"use client";

import React, { useState, useEffect, useCallback } from "react";
import { searchMedical, evaluateCdss } from "@/lib/services";
import { silentCatch } from "@/lib/handle-error";

interface DiagnosisSuggestion {
  code: string;
  description: string;
  cie10CodeId?: string;
  confidence?: number;
  source?: string;
}

interface DiagnosisItem {
  code: string;
  description: string;
  cie10CodeId?: string;
}

interface SmartDiagnosisPickerProps {
  value?: string;
  onChange: (item: DiagnosisItem) => void;
  onConfirm?: (item: DiagnosisItem) => void;
  symptoms?: string[];
  clinicId?: string | null;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SmartDiagnosisPicker({
  value = "",
  onChange,
  onConfirm,
  symptoms = [],
  clinicId,
  placeholder = "Buscar diagnóstico (CIE-10)...",
  debounceMs = 300,
  className = "",
}: SmartDiagnosisPickerProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<DiagnosisSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const [searchRes, cdssRes] = await Promise.all([
          searchMedical(q, "diagnostic"),
          evaluateCdss([q], { clinicId: clinicId ?? undefined }),
        ]);
        const data = searchRes as { data?: { diagnostics?: { id?: string; code?: string; description?: string }[] } };
        const diagnostics = data?.data?.diagnostics ?? [];
        const fromSearch = (Array.isArray(diagnostics) ? diagnostics : []).map(
          (d: { id?: string; code?: string; description?: string }) => ({
            code: d.code ?? "",
            description: d.description ?? "",
            cie10CodeId: d.id,
            confidence: 0.8,
            source: "search",
          })
        );
        const fromCdss = (cdssRes?.suggested_diagnoses ?? []).map((d) => ({
          code: d.code ?? "",
          description: d.description ?? d.code ?? "",
          cie10CodeId: undefined,
          confidence: 0.5,
          source: "ai",
        }));
        const seen = new Set<string>();
        const merged: DiagnosisSuggestion[] = [];
        for (const s of [...fromSearch, ...fromCdss]) {
          const key = `${s.code}-${(s.description || "").toLowerCase()}`;
          if (s.code && !seen.has(key)) {
            seen.add(key);
            merged.push(s);
          }
        }
        setSuggestions(merged.slice(0, 12));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [clinicId]
  );

  useEffect(() => {
    const t = setTimeout(() => fetchSuggestions(input), debounceMs);
    return () => clearTimeout(t);
  }, [input, debounceMs, fetchSuggestions]);

  useEffect(() => {
    if (symptoms.length > 0 && !input.trim()) {
      evaluateCdss(symptoms, { clinicId: clinicId ?? undefined })
        .then((res) => {
          const diag = (res?.suggested_diagnoses ?? []).slice(0, 8);
          setSuggestions(
            diag.map((d) => ({
              code: d.code ?? "",
              description: d.description ?? d.code ?? "",
              confidence: d.confidence ?? 0.5,
              source: "ai",
            }))
          );
        })
        .catch(silentCatch("CDSS AI diagnóstico"));
    }
  }, [symptoms.join(","), clinicId]);

  const select = (s: DiagnosisSuggestion) => {
    const item: DiagnosisItem = {
      code: s.code,
      description: s.description,
      cie10CodeId: s.cie10CodeId,
    };
    onChange(item);
    onConfirm?.(item);
    setInput(`${s.code} - ${s.description}`);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
      {open && (suggestions.length > 0 || loading) && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">Buscando...</li>
          ) : (
            suggestions.map((s, i) => (
              <li
                key={`${s.code}-${i}`}
                className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer flex justify-between"
                onMouseDown={() => select(s)}
              >
                <span>
                  <strong>{s.code}</strong> {s.description}
                </span>
                {s.confidence != null && (
                  <span className="text-indigo-600 text-xs">
                    {Math.round((s.confidence ?? 0) * 100)}%
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
