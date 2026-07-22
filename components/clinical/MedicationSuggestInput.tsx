"use client";

import React, { useEffect, useRef, useState } from "react";
import { suggestMedicationPresentations } from "@/lib/services/prescriptions";
import { formatPresentationSecondaryLine } from "@/lib/prescription-catalog";
import type { SmartMedicationSuggestion } from "@/lib/types/drug-catalog";

export interface MedicationSuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Catalog-aware selection (PR-1). When set, preferred over string-only onChange for picks. */
  onSelectPresentation?: (suggestion: SmartMedicationSuggestion) => void;
  consultationId?: string | null;
  cie10CodeId?: string | null;
  patientId?: string | null;
  countryCode?: string;
  placeholder?: string;
  debounceMs?: number;
  minChars?: number;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

/**
 * Autocompletado de presentaciones vía smart-suggestions (catalog-aware).
 * Legacy free-text typing still calls onChange(string).
 */
export function MedicationSuggestInput({
  value,
  onChange,
  onSelectPresentation,
  consultationId,
  cie10CodeId,
  patientId,
  countryCode,
  placeholder = "Medicamento",
  debounceMs = 280,
  minChars = 2,
  className = "",
  inputClassName = "",
  disabled = false,
}: MedicationSuggestInputProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<SmartMedicationSuggestion[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestId = useRef(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length < minChars) {
      setSuggestions([]);
      setActiveIndex(-1);
      setLoading(false);
      return;
    }

    const timer = window.setTimeout(() => {
      const current = ++requestId.current;
      setLoading(true);
      void suggestMedicationPresentations(trimmed, {
        consultationId: consultationId ?? undefined,
        cie10CodeId: cie10CodeId ?? undefined,
        patientId: patientId ?? undefined,
        countryCode,
        limit: 12,
      })
        .then((list) => {
          if (current !== requestId.current) return;
          setSuggestions(list);
          setActiveIndex(list.length > 0 ? 0 : -1);
        })
        .catch(() => {
          if (current !== requestId.current) return;
          setSuggestions([]);
          setActiveIndex(-1);
        })
        .finally(() => {
          if (current === requestId.current) setLoading(false);
        });
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [
    input,
    debounceMs,
    minChars,
    consultationId,
    cie10CodeId,
    patientId,
    countryCode,
  ]);

  const select = (item: SmartMedicationSuggestion) => {
    setInput(item.displayLabel);
    if (onSelectPresentation) {
      onSelectPresentation(item);
    } else {
      onChange(item.displayLabel);
    }
    setOpen(false);
    setActiveIndex(-1);
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
      select(suggestions[activeIndex]!);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.querySelectorAll("[data-selectable=true]")[
      activeIndex
    ] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const trimmed = input.trim();
  const showDropdown =
    open &&
    trimmed.length >= minChars &&
    (loading || suggestions.length > 0);

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={input}
        disabled={disabled}
        onChange={(e) => {
          setInput(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        data-testid="medication-suggest-input"
        className={
          inputClassName ||
          "w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
        }
      />
      {showDropdown ? (
        <ul
          ref={listRef}
          role="listbox"
          data-testid="medication-suggest-list"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          {loading && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">Buscando…</li>
          ) : null}
          {!loading && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">Sin resultados</li>
          ) : null}
          {suggestions.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                data-selectable="true"
                data-presentation-id={item.id}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(item)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 ${
                  index === activeIndex
                    ? "bg-indigo-50 text-indigo-900"
                    : "text-slate-800"
                }`}
              >
                <span className="block font-medium">{item.displayLabel}</span>
                <span className="block text-[11px] text-slate-500">
                  {formatPresentationSecondaryLine(item)}
                  {item.innName ? ` · ${item.innName}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
