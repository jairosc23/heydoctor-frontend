"use client";

import {
  AGENDA_WORKSPACE_TABS,
  type AgendaWorkspaceTab,
} from "@/lib/agenda/agenda-workspace";
import { cn } from "@/lib/utils";

type Props = {
  active: AgendaWorkspaceTab;
  onChange: (tab: AgendaWorkspaceTab) => void;
  counts?: Partial<Record<AgendaWorkspaceTab, number>>;
};

/** Horizontal tablist for Agenda Enterprise workspace sections. */
export function AgendaWorkspaceNav({ active, onChange, counts }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Secciones de Agenda Enterprise"
      className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-soft dark:border-slate-700 dark:bg-slate-900"
    >
      {AGENDA_WORKSPACE_TABS.map((tab) => {
        const selected = active === tab.id;
        const count = counts?.[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`agenda-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`agenda-panel-${tab.id}`}
            title={tab.description}
            onClick={() => onChange(tab.id)}
            className={cn(
              "min-w-[7.5rem] flex-1 rounded-xl px-3 py-2.5 text-left transition sm:min-w-0",
              selected
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{tab.label}</span>
              {typeof count === "number" ? (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    selected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800",
                  )}
                >
                  {count}
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                "mt-0.5 hidden text-[11px] leading-snug sm:block",
                selected ? "text-white/80" : "text-slate-400",
              )}
            >
              {tab.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
