"use client";

import { useCopilotNavigationOptional } from "@/context/CopilotNavigationContext";
import { COPILOT_HUB_CTA_COPY } from "@/lib/copilot-navigation";
import { cn } from "@/lib/utils";

export type CopilotHubCtaProps = {
  className?: string;
};

/** CTA suave Phase 4.8.3C — redirige al hub IA sin retirar superficies legacy. */
export function CopilotHubCta({ className }: CopilotHubCtaProps) {
  const nav = useCopilotNavigationOptional();
  if (!nav) return null;

  return (
    <p
      className={cn(
        "rounded-lg border border-indigo-200/70 bg-indigo-50/50 px-3 py-2 text-[11px] leading-snug text-indigo-900",
        className,
      )}
    >
      {COPILOT_HUB_CTA_COPY}{" "}
      <button
        type="button"
        onClick={() => nav.openCopilotSection("generative")}
        className="font-semibold text-primary underline-offset-2 hover:underline"
      >
        Abrir asistente generativo
      </button>
    </p>
  );
}
