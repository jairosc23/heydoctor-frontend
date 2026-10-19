"use client";

import {
  clinicalStatusBadgeClass,
  getClinicalStatus,
  type ClinicalStatusKey,
} from "@/lib/clinical-status-language";
import { cn } from "@/lib/utils";

export function ClinicalStatusBadge({
  status,
  label,
  className,
  showDot = true,
}: {
  status: ClinicalStatusKey;
  label?: string;
  className?: string;
  showDot?: boolean;
}) {
  const presentation = getClinicalStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors duration-hd-fast",
        clinicalStatusBadgeClass(status),
        className,
      )}
    >
      {showDot ? <span aria-hidden>{presentation.dot}</span> : null}
      {label ?? presentation.label}
    </span>
  );
}
