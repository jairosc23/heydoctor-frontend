import { AgendaStatusBadge, type AgendaBadgeTone } from "@/components/agenda/AgendaStatusBadge";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: string | number;
  hint?: string;
  tone?: AgendaBadgeTone;
  className?: string;
};

/** Read-only KPI tile for Agenda Enterprise dashboard. */
export function AgendaDashboardKpiCard({
  title,
  value,
  hint,
  tone = "neutral",
  className,
}: Props) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-700 dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </h3>
        <AgendaStatusBadge label="SSOT" tone={tone} title={hint} />
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </article>
  );
}
