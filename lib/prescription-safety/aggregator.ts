/**
 * Visual Alert Aggregator — dedupe + sort for Safety Panel.
 * No clinical logic.
 */

import type { SafetyAlert, SafetyPriority, SafetySeverity } from "./types";

const SEVERITY_RANK: Record<SafetySeverity, number> = {
  CRITICAL: 0,
  WARNING: 1,
  INFO: 2,
};

const PRIORITY_RANK: Record<SafetyPriority, number> = {
  HIGH: 0,
  NORMAL: 1,
  LOW: 2,
};

/** Stable dedupe key: rule + lines + message (ignores duplicate emissions). */
export function alertDedupeKey(alert: SafetyAlert): string {
  const lines = [...alert.lineIndexes].sort((a, b) => a - b).join(",");
  return `${alert.ruleId}|${lines}|${alert.message}|${alert.severity}`;
}

export function dedupeAlerts(alerts: SafetyAlert[]): SafetyAlert[] {
  const seen = new Map<string, SafetyAlert>();
  for (const alert of alerts) {
    const key = alertDedupeKey(alert);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, alert);
      continue;
    }
    // Keep earlier arrival; prefer higher priority if same arrival window.
    if (alert.arrivedAt < existing.arrivedAt) {
      seen.set(key, alert);
    } else if (
      alert.arrivedAt === existing.arrivedAt &&
      PRIORITY_RANK[alert.priority] < PRIORITY_RANK[existing.priority]
    ) {
      seen.set(key, alert);
    }
  }
  return [...seen.values()];
}

/**
 * Sort: 1) severity 2) priority 3) arrival order.
 */
export function sortAlerts(alerts: SafetyAlert[]): SafetyAlert[] {
  return [...alerts].sort((a, b) => {
    const bySeverity = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (bySeverity !== 0) return bySeverity;
    const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (byPriority !== 0) return byPriority;
    return a.arrivedAt - b.arrivedAt;
  });
}

export function aggregateAlerts(alerts: SafetyAlert[]): SafetyAlert[] {
  return sortAlerts(dedupeAlerts(alerts));
}

export function severityRank(severity: SafetySeverity): number {
  return SEVERITY_RANK[severity];
}

export function priorityRank(priority: SafetyPriority): number {
  return PRIORITY_RANK[priority];
}
