import assert from "node:assert/strict";
import type { EnterpriseSignalPack } from "./enterprise-signal";

/** Contract fixture — mirrors BE EnterpriseSignalPackDto seals. */
const sample: EnterpriseSignalPack = {
  generatedAt: "2026-07-18T00:00:00.000Z",
  source: "enterprise_signal_pack",
  wave: "W5",
  phiSafe: true,
  tenantSafeNote: "audit_export_clinic_scoped; ops_metrics_are_instance_scoped",
  readiness: {
    status: "degraded",
    ok: true,
    degradedReasons: ["outbox:dead_letters"],
    source: "ops_enterprise_signal_composition",
    hidesDegraded: false,
  },
  deployment: {},
  alerts: {
    criticalAlertsEnabled: true,
    catalogCount: 1,
    recentAlertCount: 0,
    catalog: [
      {
        id: "http_5xx",
        level: "critical",
        signal: "error_rate",
        threshold: 0.05,
        runbook: "docs/runbooks/http.md",
        purpose: "HTTP errors",
      },
    ],
    recentAlerts: [],
  },
  asyncReliability: {
    riskStatus: "needs_attention",
    risks: ["outbox_backlog"],
    outbox: {
      pending: 0,
      retrying: 0,
      deadLetter: 2,
      oldestDeadLetterCreatedAt: null,
    },
    payments: { pendingPayments: 0, stalePendingPayments: 0 },
  },
  deadLetters: {
    failedOutboxEvents: 2,
    retryExhausted: 2,
    poisonEvents: 0,
    stuckRetries: 0,
    pendingPayments: 0,
    metrics: { retryRate: 0, deadLetterRate: 0.1, queueLagMs: 1 },
  },
  audit: {
    exportAvailable: true,
    endpoint: "GET /api/audit/export",
    format: "csv",
    tenantScoped: true,
    clinicIdPresent: true,
  },
  executiveSummary: {
    label: "degradada",
    headline: "Plataforma degradada",
    bulletPoints: ["Readiness: degraded"],
  },
};

assert.equal(sample.phiSafe, true);
assert.equal(sample.readiness.hidesDegraded, false);
assert.ok(sample.readiness.degradedReasons.includes("outbox:dead_letters"));
assert.equal(sample.audit.tenantScoped, true);
assert.ok(sample.alerts.catalog[0]?.runbook);

console.log("enterprise-signal.test.ts: ok");
