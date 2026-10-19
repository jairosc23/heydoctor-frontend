"use client";

import { DoctorDnaCard } from "@/components/clinical/DoctorDnaCard";
import { cn } from "@/lib/utils";

export interface DoctorDnaCollapsibleProps {
  className?: string;
}

export function DoctorDnaCollapsible({ className }: DoctorDnaCollapsibleProps) {
  return (
    <details
      className={cn(
        "group rounded-lg border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          <span>Mi práctica clínica (Doctor DNA)</span>
          <span
            className="text-xs font-normal text-slate-500 group-open:rotate-180 transition-transform"
            aria-hidden
          >
            ▾
          </span>
        </span>
      </summary>
      <div className="border-t border-slate-100 p-2">
        <DoctorDnaCard className="border-0 shadow-none p-2" />
      </div>
    </details>
  );
}
