/**
 * P0-A — Workspace bootstrap metrics (in-memory, PHI-safe).
 * Used for Clinical QA / smoke measurement.
 */

export type CopilotBootstrapMetrics = {
  attempts: number;
  completed: number;
  lastLatencyMs: number | null;
  lastMode: "lazy_workspace_open" | "eager_flag" | null;
  lastConsultationRef: string | null;
  /** Estimated API calls for last successful bootstrap path (session + 4 panels). */
  lastEstimatedRequests: number | null;
};

const metrics: CopilotBootstrapMetrics = {
  attempts: 0,
  completed: 0,
  lastLatencyMs: null,
  lastMode: null,
  lastConsultationRef: null,
  lastEstimatedRequests: null,
};

function truncateRef(id: string): string {
  return id.length <= 10 ? id : `${id.slice(0, 10)}…`;
}

export function recordCopilotBootstrapStart(input: {
  consultationId: string;
  mode: "lazy_workspace_open" | "eager_flag";
}): void {
  metrics.attempts += 1;
  metrics.lastMode = input.mode;
  metrics.lastConsultationRef = truncateRef(input.consultationId);
}

export function recordCopilotBootstrapComplete(input: {
  latencyMs: number;
  estimatedRequests: number;
}): void {
  metrics.completed += 1;
  metrics.lastLatencyMs = input.latencyMs;
  metrics.lastEstimatedRequests = input.estimatedRequests;
}

export function getCopilotBootstrapMetrics(): CopilotBootstrapMetrics {
  return { ...metrics };
}

/** @internal tests */
export function __resetCopilotBootstrapMetricsForTests(): void {
  metrics.attempts = 0;
  metrics.completed = 0;
  metrics.lastLatencyMs = null;
  metrics.lastMode = null;
  metrics.lastConsultationRef = null;
  metrics.lastEstimatedRequests = null;
}
