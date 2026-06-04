"use client";

import { cn } from "@/lib/utils";
import {
  NEXT_STATUS,
  NEXT_STATUS_LABELS,
  STATUS_BADGE_CLASS,
  STATUS_LABELS,
} from "./consultation-status";

export interface PatientBannerProps {
  patientName: string;
  chiefComplaint: string;
  status: string;
  transitioning: boolean;
  onBack: () => void;
  onShare: () => void;
  onTransition?: () => void;
}

export function PatientBanner({
  patientName,
  chiefComplaint,
  status,
  transitioning,
  onBack,
  onShare,
  onTransition,
}: PatientBannerProps) {
  const nextLabel = NEXT_STATUS[status];
  const badgeClass = STATUS_BADGE_CLASS[status] ?? "bg-slate-400";

  return (
    <div
      className={cn(
        "sticky top-0 z-30 -mx-4 mb-2 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur",
        "md:-mx-6 md:px-6 lg:-mx-8 lg:px-8",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="mb-2 text-sm font-medium text-primary hover:text-primaryMid"
          >
            ← Volver a consultas
          </button>
          <h1 className="font-[Montserrat] text-xl font-bold text-primary md:text-2xl">
            Consulta — {patientName}
          </h1>
          <p className="mt-1 truncate text-sm text-slate-600">
            Motivo: {chiefComplaint || "—"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onShare}
            className="rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primaryLight"
          >
            Compartir
          </button>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold text-white",
              badgeClass,
            )}
          >
            {STATUS_LABELS[status] ?? status}
          </span>
          {nextLabel && onTransition ? (
            <button
              type="button"
              onClick={onTransition}
              disabled={transitioning}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primaryMid disabled:opacity-60"
            >
              {transitioning ? "Cambiando…" : NEXT_STATUS_LABELS[status]}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
