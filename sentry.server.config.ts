import * as Sentry from "@sentry/nextjs";
import { getQaSentryOptions } from "@/lib/sentry-qa-options";
import { withSentryPrivacyGate } from "@/lib/sentry-privacy-transport";

const options = getQaSentryOptions(process.env);
if (options) {
  Sentry.init({
    ...options,
    transport: (
      transportOptions: Parameters<typeof Sentry.makeNodeTransport>[0],
    ) => withSentryPrivacyGate(Sentry.makeNodeTransport(transportOptions)),
  });
}
