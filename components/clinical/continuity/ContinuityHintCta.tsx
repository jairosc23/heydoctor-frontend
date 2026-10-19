"use client";

import { cn } from "@/lib/utils";

/**
 * PR-11 C2 — opt-in CTA on a Continuity hint.
 * Does not fetch or write — only signals the handoff orchestrator.
 */
export function ContinuityHintCta({
  disabled,
  busy,
  onUse,
}: {
  disabled?: boolean;
  busy?: boolean;
  onUse: () => void;
}) {
  const blocked = Boolean(disabled || busy);
  return (
    <button
      type="button"
      data-testid="continuity-hint-cta"
      disabled={blocked}
      onClick={() => {
        if (blocked) return;
        onUse();
      }}
      className={cn(
        "mt-2 rounded-md border border-primary/30 bg-primaryLight px-2.5 py-1 text-[11px] font-medium text-primary",
        blocked && "cursor-not-allowed opacity-50",
      )}
    >
      {busy ? "Aplicando…" : "Usar en Composer"}
    </button>
  );
}
