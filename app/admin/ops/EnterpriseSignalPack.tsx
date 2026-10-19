"use client";

import type { EnterpriseSignalPack } from "@/lib/admin/enterprise-signal";

function statusTone(status: EnterpriseSignalPack["readiness"]["status"]) {
  if (status === "ready") return "border-emerald-300 bg-emerald-50 text-emerald-950";
  if (status === "degraded") return "border-amber-300 bg-amber-50 text-amber-950";
  return "border-red-300 bg-red-50 text-red-950";
}

export function EnterpriseSignalPackPanel({
  pack,
}: {
  pack: EnterpriseSignalPack;
}) {
  return (
    <section
      className="mb-6 space-y-4 rounded-lg border border-hd-border-subtle bg-white p-4 shadow-sm"
      data-testid="enterprise-signal-pack"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-primaryDark">
            Enterprise Signal Pack (W5)
          </h2>
          <p className="text-xs text-primaryDark/60">
            Señal operativa real para admin de clínica · PHI-safe · no oculta
            degradaciones · audit export clinic-scoped
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusTone(
            pack.readiness.status,
          )}`}
          data-testid="enterprise-signal-readiness"
        >
          {pack.executiveSummary.label}
        </span>
      </div>

      <div
        className={`rounded-md border px-3 py-2 text-sm ${statusTone(
          pack.readiness.status,
        )}`}
        role="status"
      >
        <p className="font-medium">{pack.executiveSummary.headline}</p>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
          {pack.executiveSummary.bulletPoints.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Readiness"
          value={pack.readiness.status}
          hint={
            pack.readiness.degradedReasons.length
              ? pack.readiness.degradedReasons.join(", ")
              : "sin degradedReasons"
          }
        />
        <Stat
          label="Outbox DL"
          value={String(pack.asyncReliability.outbox.deadLetter)}
          hint={`failed=${pack.deadLetters.failedOutboxEvents} · lag=${pack.deadLetters.metrics.queueLagMs}ms`}
        />
        <Stat
          label="Async risk"
          value={pack.asyncReliability.riskStatus}
          hint={
            pack.asyncReliability.risks[0]
              ? pack.asyncReliability.risks.slice(0, 2).join(", ")
              : "ok"
          }
        />
        <Stat
          label="Audit export"
          value={pack.audit.exportAvailable ? "disponible" : "—"}
          hint={`${pack.audit.format} · tenant-scoped${
            pack.audit.clinicIdPresent ? "" : " · sin clinicId"
          }`}
        />
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primaryDark/60">
          Alert catalog + runbooks
        </h3>
        <div className="overflow-x-auto rounded border border-hd-border-subtle">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-hd-surface-muted uppercase text-primaryDark/70">
              <tr>
                <th className="px-2 py-1.5">Alert</th>
                <th className="px-2 py-1.5">Level</th>
                <th className="px-2 py-1.5">Signal</th>
                <th className="px-2 py-1.5">Threshold</th>
                <th className="px-2 py-1.5">Runbook</th>
              </tr>
            </thead>
            <tbody>
              {pack.alerts.catalog.map((a) => (
                <tr key={a.id} className="border-t border-hd-border-subtle">
                  <td className="px-2 py-1.5 font-mono">{a.id}</td>
                  <td className="px-2 py-1.5">{a.level}</td>
                  <td className="px-2 py-1.5 font-mono">{a.signal}</td>
                  <td className="px-2 py-1.5 tabular-nums">{a.threshold}</td>
                  <td className="px-2 py-1.5 font-mono text-[11px]">
                    {a.runbook}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pack.alerts.recentAlerts.length > 0 ? (
          <div className="mt-3" data-testid="enterprise-signal-recent-alerts">
            <p className="mb-1 text-xs font-semibold text-primaryDark/60">
              Recent alerts (réplica)
            </p>
            <ul className="space-y-1 text-xs text-primaryDark/80">
              {pack.alerts.recentAlerts.slice(0, 8).map((a) => (
                <li key={`${a.at}-${a.event}`}>
                  <span className="font-mono">{a.level}</span> · {a.event}
                  {a.message ? ` — ${a.message}` : ""} ·{" "}
                  <span className="text-primaryDark/50">{a.at}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div data-testid="enterprise-signal-async">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primaryDark/60">
          Async reliability
        </h3>
        <div className="grid gap-2 text-xs sm:grid-cols-3">
          <p>
            Pending:{" "}
            <strong className="tabular-nums">
              {pack.asyncReliability.outbox.pending}
            </strong>
          </p>
          <p>
            Retrying:{" "}
            <strong className="tabular-nums">
              {pack.asyncReliability.outbox.retrying}
            </strong>
          </p>
          <p>
            Payments pending:{" "}
            <strong className="tabular-nums">
              {pack.asyncReliability.payments.pendingPayments}
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded border border-hd-border-subtle bg-hd-surface-muted/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-primaryDark/50">
        {label}
      </p>
      <p className="font-semibold tabular-nums text-primaryDark">{value}</p>
      <p className="truncate text-[11px] text-primaryDark/55" title={hint}>
        {hint}
      </p>
    </div>
  );
}
