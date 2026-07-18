/**
 * W5 — Typed client for GET /api/admin/ops/enterprise-signal
 */
import { fetchWithAuth } from "@/lib/heydoctor-api";

export type EnterpriseSignalPack = {
  generatedAt: string;
  source: "enterprise_signal_pack";
  wave: "W5";
  phiSafe: true;
  tenantSafeNote: string;
  readiness: {
    status: "ready" | "degraded" | "not_ready";
    ok: boolean;
    degradedReasons: string[];
    source: string;
    hidesDegraded: false;
  };
  deployment: Record<string, unknown>;
  alerts: {
    criticalAlertsEnabled: boolean;
    catalogCount: number;
    recentAlertCount: number;
    catalog: Array<{
      id: string;
      level: string;
      signal: string;
      threshold: number;
      runbook: string;
      purpose: string;
    }>;
    recentAlerts: Array<{
      at: string;
      event: string;
      level: string;
      message?: string;
    }>;
  };
  asyncReliability: {
    riskStatus: "ok" | "needs_attention";
    risks: string[];
    outbox: {
      pending: number;
      retrying: number;
      deadLetter: number;
      oldestDeadLetterCreatedAt: string | null;
    };
    payments: {
      pendingPayments: number;
      stalePendingPayments: number;
    };
  };
  deadLetters: {
    failedOutboxEvents: number;
    retryExhausted: number;
    poisonEvents: number;
    stuckRetries: number;
    pendingPayments: number;
    metrics: {
      retryRate: number;
      deadLetterRate: number;
      queueLagMs: number;
    };
  };
  audit: {
    exportAvailable: true;
    endpoint: string;
    format: "csv";
    tenantScoped: true;
    clinicIdPresent: boolean;
  };
  executiveSummary: {
    label: "operativa" | "degradada" | "no_lista";
    headline: string;
    bulletPoints: string[];
  };
};

export async function fetchEnterpriseSignalPack(): Promise<EnterpriseSignalPack> {
  const res = await fetchWithAuth("/api/admin/ops/enterprise-signal", {
    method: "GET",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status}: ${t.slice(0, 200)}`);
  }
  return (await res.json()) as EnterpriseSignalPack;
}
