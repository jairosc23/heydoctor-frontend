"use client";

import { cn } from "@/lib/utils";

/**
 * Opt-in entry chip for Continuity / Encounter Timeline.
 * Does not fetch — only toggles open state.
 */
export function ContinuityEntry({
  open,
  onOpenChange,
  disabled,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      data-testid="continuity-entry"
      aria-pressed={open}
      disabled={disabled}
      onClick={() => {
        onOpenChange(!open);
      }}
      className={cn(
        "clinical-chip clinical-interactive inline-flex items-center gap-1 rounded-hd-md border px-2.5 py-1.5 text-xs font-medium",
        open
          ? "border-primary/30 bg-primaryLight text-primary"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
        disabled && "opacity-50",
      )}
    >
      <span aria-hidden>◎</span>
      Continuity
    </button>
  );
}
