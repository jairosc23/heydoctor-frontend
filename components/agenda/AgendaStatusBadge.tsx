import { cn } from "@/lib/utils";

export type AgendaBadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

const TONE_CLASS: Record<AgendaBadgeTone, string> = {
  neutral:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  success:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
  warning:
    "bg-amber-100 text-amber-950 dark:bg-amber-900/40 dark:text-amber-100",
  danger: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
  info: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100",
};

type Props = {
  label: string;
  value?: string | number;
  tone?: AgendaBadgeTone;
  title?: string;
};

/** Compact status chip for Agenda Enterprise workspace (presentation only). */
export function AgendaStatusBadge({
  label,
  value,
  tone = "neutral",
  title,
}: Props) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
        TONE_CLASS[tone],
      )}
    >
      <span className="opacity-80">{label}</span>
      {value !== undefined ? (
        <span className="tabular-nums">{value}</span>
      ) : null}
    </span>
  );
}
