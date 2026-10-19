import { cn } from "@/lib/utils";

type Props = {
  rows?: number;
  className?: string;
  label?: string;
};

/** Unified loading skeleton for Agenda Enterprise surfaces. */
export function AgendaSkeleton({
  rows = 4,
  className,
  label = "Cargando…",
}: Props) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
          style={{ width: `${92 - i * 8}%` }}
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
