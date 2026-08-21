"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  searchDiagnostics,
  type DiagnosticSearchResult,
} from "@/lib/services/search";
import {
  diagnosisDraftItemFromText,
  shouldCommitDiagnosisPickerDraft,
} from "@/lib/services/consultation-diagnosis";
import {
  fetchDiagnosisSuggestions,
  toggleFavoriteDiagnosis,
  type DiagnosisSuggestion,
  type DiagnosisSuggestionsPayload,
} from "@/lib/services/diagnosis-preferences";

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
  /** Sprint 1A.2: favoritos, recientes y más usados */
  showPreferences?: boolean;
}

type PickerRow =
  | { kind: "section"; label: string; key: string }
  | { kind: "item"; item: DiagnosisSuggestion; key: string };

const EMPTY_PREFERENCES: DiagnosisSuggestionsPayload = {
  favorites: [],
  recent: [],
  frequent: [],
};

function toDiagnosisItem(item: DiagnosisSuggestion): DiagnosisItem {
  return {
    code: item.code,
    description: item.description,
    cie10CodeId: item.id,
  };
}

function buildPreferenceRows(
  payload: DiagnosisSuggestionsPayload,
): PickerRow[] {
  const rows: PickerRow[] = [];
  if (payload.favorites.length > 0) {
    rows.push({ kind: "section", label: "Favoritos", key: "sec-fav" });
    for (const item of payload.favorites) {
      rows.push({ kind: "item", item, key: `fav-${item.id}` });
    }
  }
  if (payload.recent.length > 0) {
    rows.push({ kind: "section", label: "Recientes", key: "sec-recent" });
    for (const item of payload.recent) {
      rows.push({ kind: "item", item, key: `recent-${item.id}` });
    }
  }
  if (payload.frequent.length > 0) {
    rows.push({
      kind: "section",
      label: "Más utilizados",
      key: "sec-frequent",
    });
    for (const item of payload.frequent) {
      rows.push({ kind: "item", item, key: `freq-${item.id}` });
    }
  }
  return rows;
}

/**
 * Picker CIE-10: búsqueda incremental + favoritos/recientes/frecuentes (1A.2).
 */
export function SmartDiagnosisPicker({
  value = "",
  onChange,
  onConfirm,
  placeholder = "Buscar diagnóstico (CIE-10)...",
  debounceMs = 280,
  className = "",
  showPreferences = true,
}: SmartDiagnosisPickerProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<DiagnosticSearchResult[]>([]);
  const [preferences, setPreferences] =
    useState<DiagnosisSuggestionsPayload>(EMPTY_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [confirming, setConfirming] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const skipDraftCommitRef = useRef(false);

  const isSearchMode = input.trim().length >= 2;

  const preferenceRows = useMemo(
    () => buildPreferenceRows(preferences),
    [preferences],
  );

  const selectablePreferenceItems = useMemo(
    () =>
      preferenceRows.filter(
        (r): r is Extract<PickerRow, { kind: "item" }> => r.kind === "item",
      ),
    [preferenceRows],
  );

  const loadPreferences = useCallback(async (q?: string) => {
    if (!showPreferences) return;
    setLoading(true);
    try {
      const data = await fetchDiagnosisSuggestions(q);
      setPreferences(data);
      if (!isSearchMode) {
        setActiveIndex(
          data.favorites.length + data.recent.length + data.frequent.length > 0
            ? 0
            : -1,
        );
      }
    } catch {
      setPreferences(EMPTY_PREFERENCES);
      setActiveIndex(-1);
    } finally {
      setLoading(false);
    }
  }, [showPreferences, isSearchMode]);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 2) {
        setSuggestions([]);
        if (showPreferences) {
          await loadPreferences(trimmed);
        } else {
          setActiveIndex(-1);
        }
        return;
      }
      setLoading(true);
      try {
        const results = await searchDiagnostics(trimmed);
        setSuggestions(results);
        setActiveIndex(results.length > 0 ? 0 : -1);
      } catch {
        setSuggestions([]);
        setActiveIndex(-1);
      } finally {
        setLoading(false);
      }
    },
    [loadPreferences, showPreferences],
  );

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchSuggestions(input), debounceMs);
    return () => clearTimeout(timer);
  }, [input, debounceMs, fetchSuggestions]);

  const commitDraft = useCallback(() => {
    const typed = input.trim();
    if (!shouldCommitDiagnosisPickerDraft(value, typed)) {
      setInput(value);
      setOpen(false);
      return;
    }
    onChange(diagnosisDraftItemFromText(typed));
    setOpen(false);
  }, [input, onChange, value]);

  const select = async (item: DiagnosisSuggestion | DiagnosticSearchResult) => {
    skipDraftCommitRef.current = true;
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
        if (showPreferences) {
          await loadPreferences();
        }
      } finally {
        setConfirming(false);
      }
    }
  };

  const handleToggleFavorite = async (
    event: React.MouseEvent,
    cie10CodeId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setTogglingId(cie10CodeId);
    try {
      await toggleFavoriteDiagnosis(cie10CodeId);
      await loadPreferences(isSearchMode ? input : undefined);
      if (isSearchMode) {
        const results = await searchDiagnostics(input.trim());
        setSuggestions(results);
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const items = isSearchMode
      ? suggestions
      : selectablePreferenceItems.map((r) => r.item);

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      setInput(value);
      return;
    }

    if (event.key === "Enter") {
      if (open && activeIndex >= 0 && items[activeIndex]) {
        event.preventDefault();
        void select(items[activeIndex]);
        return;
      }
      event.preventDefault();
      commitDraft();
      return;
    }

    if (!open || items.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? items.length - 1 : prev - 1,
      );
    }
  };

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current || isSearchMode) return;
    const selectable = listRef.current.querySelectorAll("[data-selectable=true]");
    const item = selectable[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isSearchMode]);

  const hasPreferenceContent =
    preferences.favorites.length > 0 ||
    preferences.recent.length > 0 ||
    preferences.frequent.length > 0;

  const showDropdown =
    open &&
    (loading ||
      (isSearchMode && (suggestions.length > 0 || input.trim().length >= 2)) ||
      (!isSearchMode && (hasPreferenceContent || showPreferences)));

  let selectableCounter = -1;

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          if (!isSearchMode && showPreferences) {
            void loadPreferences();
          }
        }}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false);
            if (skipDraftCommitRef.current) {
              skipDraftCommitRef.current = false;
              return;
            }
            commitDraft();
          }, 150);
        }}
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
          className="absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
          onMouseDown={() => {
            skipDraftCommitRef.current = true;
          }}
        >
          {loading && !isSearchMode && !hasPreferenceContent ? (
            <li className="px-3 py-2 text-sm text-slate-500">Cargando...</li>
          ) : null}

          {!isSearchMode && showPreferences ? (
            <>
              {!loading && !hasPreferenceContent ? (
                <li className="px-3 py-2 text-sm text-slate-500">
                  Escribe al menos 2 caracteres o marca diagnósticos como
                  favoritos.
                </li>
              ) : null}
              {preferenceRows.map((row) => {
                if (row.kind === "section") {
                  return (
                    <li
                      key={row.key}
                      className="sticky top-0 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {row.label}
                    </li>
                  );
                }
                selectableCounter += 1;
                const index = selectableCounter;
                const isActive = activeIndex === index;
                return (
                  <li
                    key={row.key}
                    data-selectable="true"
                    role="option"
                    aria-selected={isActive}
                    className={`flex cursor-pointer items-start gap-2 px-3 py-2 text-sm ${
                      isActive ? "bg-indigo-100" : "hover:bg-indigo-50"
                    }`}
                    onMouseDown={() => void select(row.item)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs font-semibold text-indigo-800">
                        {row.item.code}
                      </div>
                      <div className="text-slate-800">{row.item.description}</div>
                    </div>
                    <button
                      type="button"
                      aria-label={
                        row.item.isFavorite
                          ? "Quitar de favoritos"
                          : "Agregar a favoritos"
                      }
                      disabled={togglingId === row.item.id}
                      className="mt-0.5 shrink-0 text-base leading-none text-amber-500 hover:text-amber-600 disabled:opacity-50"
                      onMouseDown={(e) =>
                        void handleToggleFavorite(e, row.item.id)
                      }
                    >
                      {row.item.isFavorite ? "★" : "☆"}
                    </button>
                  </li>
                );
              })}
            </>
          ) : null}

          {isSearchMode ? (
            <>
              {loading && suggestions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-slate-500">Buscando...</li>
              ) : suggestions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-slate-500">
                  Sin resultados para &quot;{input.trim()}&quot;
                </li>
              ) : (
                suggestions.map((s, index) => {
                  const fav = preferences.favorites.some((f) => f.id === s.id);
                  return (
                    <li
                      key={s.id}
                      role="option"
                      aria-selected={index === activeIndex}
                      className={`flex cursor-pointer items-start gap-2 px-3 py-2 text-sm ${
                        index === activeIndex
                          ? "bg-indigo-100"
                          : "hover:bg-indigo-50"
                      }`}
                      onMouseDown={() => void select(s)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs font-semibold text-indigo-800">
                          {s.code}
                        </div>
                        <div className="text-slate-800">{s.description}</div>
                      </div>
                      {showPreferences ? (
                        <button
                          type="button"
                          aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
                          disabled={togglingId === s.id}
                          className="mt-0.5 shrink-0 text-base leading-none text-amber-500 hover:text-amber-600 disabled:opacity-50"
                          onMouseDown={(e) => void handleToggleFavorite(e, s.id)}
                        >
                          {fav ? "★" : "☆"}
                        </button>
                      ) : null}
                    </li>
                  );
                })
              )}
            </>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
