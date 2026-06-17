"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProfileFieldGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </dl>
  );
}

export function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-slate-800">{value || "—"}</dd>
    </div>
  );
}

export function ProfileTextBlock({
  lines,
  emptyLabel = "Sin registros documentados.",
}: {
  lines: string[];
  emptyLabel?: string;
}) {
  if (lines.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }
  return (
    <ul className="list-inside list-disc space-y-1 text-sm text-slate-800">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}
