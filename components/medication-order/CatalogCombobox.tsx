"use client";

/**
 * Enterprise catalog combobox — focus opens list, typeahead, ↑↓ Enter Esc.
 * Catalog codes only; labels from Medication Domain vocabularies.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CatalogEntry } from "@/lib/medication-domain";
import { labelFor, type CatalogLocale } from "@/lib/medication-domain";

export type CatalogComboboxProps = {
  label: string;
  entries: CatalogEntry[];
  valueCode: string | null;
  onChangeCode: (code: string | null) => void;
  locale?: CatalogLocale;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  emptyLabel?: string;
  "data-testid"?: string;
};

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function CatalogCombobox({
  label,
  entries,
  valueCode,
  onChangeCode,
  locale = "es",
  placeholder = "Buscar…",
  disabled,
  id: idProp,
  emptyLabel = "Sin selección",
  "data-testid": testId,
}: CatalogComboboxProps) {
  const reactId = useId();
  const inputId = idProp ?? `catalog-${reactId}`;
  const listId = `${inputId}-listbox`;

  const selected = useMemo(
    () => entries.find((e) => e.code === valueCode) ?? null,
    [entries, valueCode],
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const displayValue = open
    ? query
    : selected
      ? labelFor(selected, locale)
      : "";

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return entries;
    return entries.filter((e) => {
      const es = normalize(e.labelEs);
      const en = normalize(e.labelEn);
      const code = normalize(e.code);
      return es.includes(q) || en.includes(q) || code.includes(q);
    });
  }, [entries, query]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-combo-index="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const commit = useCallback(
    (entry: CatalogEntry | null) => {
      onChangeCode(entry?.code ?? null);
      setOpen(false);
      setQuery("");
    },
    [onChangeCode],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setQuery("");
        return;
      }
      setActiveIndex((i) =>
        filtered.length === 0 ? 0 : Math.min(i + 1, filtered.length - 1),
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const pick = filtered[activeIndex];
      if (pick) commit(pick);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      data-testid={testId ?? "catalog-combobox"}
    >
      <label
        htmlFor={inputId}
        className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && filtered[activeIndex]
              ? `${inputId}-opt-${filtered[activeIndex]!.code}`
              : undefined
          }
          disabled={disabled}
          autoComplete="off"
          placeholder={placeholder}
          value={displayValue}
          onFocus={() => {
            if (disabled) return;
            setOpen(true);
            setQuery("");
          }}
          onClick={() => {
            // Re-open when the input kept focus after Enter/Esc (focus won't re-fire).
            if (disabled) return;
            setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
        >
          ▾
        </span>
      </div>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg shadow-slate-900/10"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={!valueCode}
              data-combo-index={-1}
              className="flex w-full px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-50"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(null)}
            >
              {emptyLabel}
            </button>
          </li>
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">
              Sin coincidencias
            </li>
          ) : (
            filtered.map((entry, index) => {
              const active = index === activeIndex;
              const isSelected = entry.code === valueCode;
              return (
                <li key={entry.code}>
                  <button
                    type="button"
                    id={`${inputId}-opt-${entry.code}`}
                    role="option"
                    aria-selected={isSelected}
                    data-combo-index={index}
                    className={[
                      "flex w-full px-3 py-2.5 text-left text-sm",
                      active ? "bg-teal-50 text-teal-950" : "text-slate-800",
                      isSelected ? "font-semibold" : "font-normal",
                      "hover:bg-teal-50",
                    ].join(" ")}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(entry)}
                  >
                    {labelFor(entry, locale)}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
