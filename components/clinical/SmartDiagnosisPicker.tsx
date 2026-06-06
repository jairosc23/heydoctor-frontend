"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  searchDiagnostics,
  type DiagnosticSearchResult,
} from "@/lib/services/search";

export interface DiagnosisItem {
  code: string;
  description: string;
  cie10CodeId?: string;
}

interface SmartDiagnosisPickerProps {
  value?: string;
  onChange: (item: DiagnosisItem) => void;
  onConfirm?: (item: DiagnosisItem) => void | Promise<void>;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  /** @deprecated Sprint 1A.1: sin CDSS ni síntomas en el picker */
  symptoms?: string[];
  /** @deprecated Sprint 1A.1: sin CDSS */
  clinicId?: string | null;
}

/**
 * Picker CIE-10 con búsqueda incremental vía GET /api/search?type=diagnostic.
 */
export function SmartDiagnosisPicker({
  value = "",
  onChange,
  onConfirm,
  placeholder = "Buscar diagnóstico (CIE-10)...",
  debounceMs = 280,
  className = "",
}: SmartDiagnosisPickerProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<DiagnosticSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [confirming, setConfirming] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }
    setLoading(true);
    try {
      const results = await searchDiagnostics(q);
      setSuggestions(results);
      setActiveIndex(results.length > 0 ? 0 : -1);
    } catch {
      setSuggestions([]);
      setActiveIndex(-1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchSuggestions(input), debounceMs);
    return () => clearTimeout(timer);
  }, [input, debounceMs, fetchSuggestions]);

  const select = async (item: DiagnosticSearchResult) => {
    const diagnosisItem: DiagnosisItem = {
      code: item.code,
      description: item.description,
      cie10CodeId: item.id,
    };
    onChange(diagnosisItem);
    setInput(`${item.code} - ${item.description}`);
    setOpen(false);
    setActiveIndex(-1);

    if (onConfirm) {
      setConfirming(true);
      try {
        await onConfirm(diagnosisItem);
      } finally {
        setConfirming(false);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1,
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      void select(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const showDropdown = open && (suggestions.length > 0 || loading);

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
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      {confirming ? (
        <span className="absolute right-2 top-2 text-xs text-slate-500">
          Guardando...
        </span>
      ) : null}
      {showDropdown ? (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {loading && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">Buscando...</li>
          ) : suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">
              Sin resultados para &quot;{input.trim()}&quot;
            </li>
          ) : (
            suggestions.map((s, index) => (
              <li
                key={s.id}
                role="option"
                aria-selected={index === activeIndex}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  index === activeIndex
                    ? "bg-indigo-100"
                    : "hover:bg-indigo-50"
                }`}
                onMouseDown={() => void select(s)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="font-mono text-xs font-semibold text-indigo-800">
                  {s.code}
                </div>
                <div className="text-slate-800">{s.description}</div>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
