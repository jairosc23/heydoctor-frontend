import * as Sentry from "@sentry/nextjs";
import { sanitizeTelemetry } from "@/lib/sentry-redaction";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

function releaseId(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SENTRY_RELEASE?.trim() ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    undefined
  );
}

if (dsn) {
  Sentry.init({
    dsn,
    environment:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
      process.env.NODE_ENV ??
      "development",
    release: releaseId(),
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.12 : 1,
    beforeSend(event) {
      return sanitizeTelemetry(event);
    },
  });
}
