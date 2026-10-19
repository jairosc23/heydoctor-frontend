import * as Sentry from "@sentry/nextjs";
import { sanitizeTelemetry } from "@/lib/sentry-redaction";

const dsn =
  process.env.SENTRY_DSN?.trim() ?? process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

function releaseId(): string | undefined {
  return (
    process.env.SENTRY_RELEASE?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    undefined
  );
}

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    release: releaseId(),
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.08 : 1,
    beforeSend(event) {
      return sanitizeTelemetry(event);
    },
  });
}
