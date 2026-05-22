import { logger } from './logger';
import { emitOperationalTelemetry } from './operational-telemetry';
import {
  captureWebrtcOperationalEvent,
  sanitizeResilienceReason,
} from './observability/sentry-webrtc';
import {
  sendCallMetrics,
  type SendCallMetricsInput,
} from './send-webrtc-metrics';

type WebrtcFailureContext = {
  backendOrigin: string;
  consultationId?: string | null;
  requestId?: string | null;
  state?: string | null;
  reason?: string | null;
};

export function reportWebrtcFailure(
  event:
    | 'webrtc_ice_failed'
    | 'webrtc_signaling_failed'
    | 'webrtc_reconnect_failed',
  error: unknown,
  context: WebrtcFailureContext,
): void {
  const meta = {
    consultationId: context.consultationId ?? null,
    clientTraceId: context.requestId ?? null,
    state: context.state ?? null,
    reason: context.reason ?? null,
    error: error instanceof Error ? error.message : String(error),
  };
  emitOperationalTelemetry('webrtc.degraded', {
    outcome: 'error',
    state: context.state ?? undefined,
    reason: context.reason ?? undefined,
    requestId: context.requestId ?? null,
  });
  logger.error(event, meta);
  captureWebrtcOperationalEvent(event, meta, 'error');
}

export function reportWebrtcState(
  event:
    | 'webrtc_ice_state'
    | 'webrtc_signaling_state'
    | 'webrtc_connection_state',
  context: WebrtcFailureContext,
): void {
  const state = context.state ?? 'unknown';
  if (state === 'failed' || state === 'disconnected') {
    emitOperationalTelemetry('webrtc.degraded', {
      outcome: 'error',
      state,
      reason: context.reason ?? undefined,
      requestId: context.requestId ?? null,
    });
    logger.warn(event, {
      consultationId: context.consultationId ?? null,
      state,
      reason: context.reason ?? null,
    });
  } else if (process.env.NEXT_PUBLIC_WEBRTC_DEBUG === '1') {
    logger.log(event, {
      consultationId: context.consultationId ?? null,
      state,
    });
  }
}

export type WebrtcResilienceMetric =
  | 'reconnect_attempts'
  | 'reconnect_success'
  | 'ice_restart_count'
  | 'media_recovery_failures';

type WebrtcResilienceMetricContext = WebrtcFailureContext & {
  count?: number;
};

export async function reportWebrtcResilienceMetric(
  eventType: WebrtcResilienceMetric,
  context: WebrtcResilienceMetricContext,
): Promise<void> {
  logger.log('webrtc_resilience_metric', {
    consultationId: context.consultationId ?? null,
    eventType,
    count: context.count ?? 1,
    reason: context.reason ?? null,
  });
  if (eventType === 'reconnect_attempts' || eventType === 'reconnect_success') {
    emitOperationalTelemetry('webrtc.reconnect', {
      outcome: eventType === 'reconnect_success' ? 'success' : 'error',
      count: context.count ?? 1,
      reason: context.reason ?? undefined,
      requestId: context.requestId ?? null,
    });
  }
  if (eventType === 'ice_restart_count') {
    emitOperationalTelemetry('webrtc.ice_restart', {
      count: context.count ?? 1,
      reason: context.reason ?? undefined,
      requestId: context.requestId ?? null,
    });
  }

  if (!context.consultationId) {
    return;
  }

  const safeReason = context.reason
    ? sanitizeResilienceReason(context.reason)
    : undefined;

  const payload: SendCallMetricsInput = {
    backendOrigin: context.backendOrigin,
    consultationId: context.consultationId,
    eventType,
    eventCount: context.count ?? 1,
    clientTraceId: context.requestId ?? undefined,
    resilienceReason: safeReason,
  };

  captureWebrtcOperationalEvent('webrtc_resilience_metric', {
    consultationId: context.consultationId,
    eventType,
    count: context.count ?? 1,
    clientTraceId: context.requestId ?? null,
    resilienceReason: safeReason ?? null,
  });

  try {
    await sendCallMetrics(payload);
  } catch (error) {
    logger.warn('webrtc_resilience_metric_report_failed', {
      consultationId: context.consultationId,
      eventType,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
