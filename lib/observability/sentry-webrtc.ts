import * as Sentry from '@sentry/nextjs';

const ALLOWED_REASON = /^[a-z0-9_]{1,64}$/i;

export function captureWebrtcOperationalEvent(
  message: string,
  context: Record<string, unknown>,
  level: Sentry.SeverityLevel = 'info',
): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) return;
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.length > 200) continue;
    data[key] = value;
  }
  Sentry.addBreadcrumb({
    category: 'webrtc',
    message,
    level,
    data,
  });
  if (level === 'warning' || level === 'error') {
    Sentry.withScope((scope) => {
      scope.setTag('webrtc', '1');
      if (typeof context.consultationId === 'string') {
        scope.setTag('consultationId', context.consultationId);
      }
      if (typeof context.clientTraceId === 'string') {
        scope.setTag('clientTraceId', context.clientTraceId.slice(0, 32));
      }
      Sentry.captureMessage(message, level);
    });
  }
}

export function sanitizeResilienceReason(reason: string): string {
  const trimmed = reason.trim().slice(0, 64);
  return ALLOWED_REASON.test(trimmed) ? trimmed : 'unknown';
}
