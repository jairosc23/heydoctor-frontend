import type { NodeOptions } from "@sentry/nextjs";
import { sanitizeSentryEvent } from "./sentry-privacy-gate";

export const QA_SENTRY_PROJECT_ID = "4512510799577088";
export const QA_SENTRY_INGEST_HOST = "o4511407657123840.ingest.us.sentry.io";

/** No public DSN or cross-environment fallback, even if misconfigured. */
export function getQaSentryOptions(
  env: Readonly<Record<string, string | undefined>>,
): NodeOptions | null {
  if (
    env.RAILWAY_PROJECT_ID !== "69f7999d-03b2-4d08-9ca3-204b35ff6aae" ||
    env.RAILWAY_ENVIRONMENT_ID !== "df0bcfe1-7d25-4b71-982c-351623d99012" ||
    env.RAILWAY_SERVICE_ID !== "7dcdb503-2412-41f0-b339-17174df4aadb" ||
    env.NEXT_PUBLIC_SENTRY_DSN?.trim()
  )
    return null;
  const dsn = env.SENTRY_DSN?.trim();
  if (!dsn) return null;
  try {
    const url = new URL(dsn);
    if (
      url.protocol !== "https:" ||
      url.hostname !== QA_SENTRY_INGEST_HOST ||
      url.pathname !== `/${QA_SENTRY_PROJECT_ID}` ||
      !/^[a-f0-9]{32}$/i.test(url.username) ||
      url.password ||
      url.port ||
      url.search ||
      url.hash
    )
      return null;
  } catch {
    return null;
  }
  return {
    dsn,
    environment: "qa-isolated",
    defaultIntegrations: false,
    integrations: [],
    enableOpenTelemetrySetup: false,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      mcp: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    sendClientReports: false,
    debug: false,
    spotlight: false,
    tracesSampleRate: 0,
    profileSessionSampleRate: 0,
    beforeBreadcrumb: () => null,
    beforeSendTransaction: () => null,
    beforeSendLog: () => null,
    beforeSendMetric: () => null,
    beforeSend: (event) => ({ ...sanitizeSentryEvent(event), type: undefined }),
  };
}
