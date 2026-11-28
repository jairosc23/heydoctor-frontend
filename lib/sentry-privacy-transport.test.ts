import test from "node:test";
import assert from "node:assert/strict";
import * as Sentry from "@sentry/nextjs";
import type { Envelope, Transport } from "./sentry-privacy-transport";
import {
  sanitizeSentryEnvelope,
  withSentryPrivacyGate,
} from "./sentry-privacy-transport";
import { getQaSentryOptions } from "./sentry-qa-options";

const marker = "RC37_SYNTHETIC_PRIVATE_MARKER";
const validEnv = {
  RAILWAY_PROJECT_ID: "69f7999d-03b2-4d08-9ca3-204b35ff6aae",
  RAILWAY_ENVIRONMENT_ID: "df0bcfe1-7d25-4b71-982c-351623d99012",
  RAILWAY_SERVICE_ID: "7dcdb503-2412-41f0-b339-17174df4aadb",
  SENTRY_DSN: `https://${"a".repeat(32)}@o4511407657123840.ingest.us.sentry.io/4512510799577088`,
};
function recorder() {
  const sent: Envelope[] = [];
  const delegate: Transport = {
    send: async (envelope) => {
      sent.push(envelope);
      return { statusCode: 200 };
    },
    flush: async () => true,
  };
  return { sent, transport: withSentryPrivacyGate(delegate) };
}
const denied = [
  "client_report",
  "user_report",
  "feedback",
  "session",
  "sessions",
  "transaction",
  "attachment",
  "profile",
  "profile_chunk",
  "replay_event",
  "replay_recording",
  "check_in",
  "span",
  "log",
  "metric",
  "trace_metric",
  "raw_security",
  "future_sdk_channel",
];
for (const type of denied) {
  test(`RC37-V denies ${type} at the final transport boundary`, async () => {
    const { sent, transport } = recorder();
    await transport.send([
      { trace: { transaction: marker } },
      [[{ type }, { secret: marker }]],
    ] as unknown as Envelope);
    assert.equal(sent.length, 0);
  });
}
test("RC37-V rebuilds mixed envelopes, headers, payload and item headers from allowlist", async () => {
  const { sent, transport } = recorder();
  await transport.send([
    {
      arbitrary: marker,
      sdk: { name: marker },
      trace: { transaction: marker },
    },
    [
      [{ type: "attachment", filename: marker }, marker],
      [
        { type: "event", arbitrary: marker },
        {
          event_id: "b".repeat(32),
          message: marker,
          request: { cookies: marker },
          sdk: { name: marker },
        },
      ],
      [{ type: "log" }, { body: marker }],
    ],
  ] as unknown as Envelope);
  assert.equal(sent.length, 1);
  assert.deepEqual(Object.keys(sent[0][0]).sort(), ["event_id", "sent_at"]);
  assert.equal(sent[0][1].length, 1);
  assert.deepEqual(sent[0][1][0][0], { type: "event" });
  assert.equal(JSON.stringify(sent).includes(marker), false);
});
test("RC37-V malformed payloads and disguised transactions are denied", () => {
  for (const payload of [
    null,
    marker,
    [],
    { type: "transaction", message: marker },
  ]) {
    assert.equal(
      sanitizeSentryEnvelope([
        {},
        [[{ type: "event" }, payload]],
      ] as unknown as Envelope),
      null,
    );
  }
});
test("RC37-V sanitizer exceptions fail closed without forwarding raw data", async () => {
  const { sent, transport } = recorder();
  const payload = {
    event_id: "c".repeat(32),
    get timestamp() {
      throw new Error(marker);
    },
  };
  await transport.send([
    {},
    [[{ type: "event" }, payload]],
  ] as unknown as Envelope);
  assert.equal(sent.length, 0);
  assert.equal(await transport.flush(1), true);
});
for (const key of [
  "RAILWAY_PROJECT_ID",
  "RAILWAY_ENVIRONMENT_ID",
  "RAILWAY_SERVICE_ID",
  "SENTRY_DSN",
]) {
  test(`RC37-V absent or foreign ${key} disables SDK initialization`, () => {
    assert.equal(getQaSentryOptions({ ...validEnv, [key]: undefined }), null);
    assert.equal(getQaSentryOptions({ ...validEnv, [key]: "foreign" }), null);
  });
}
test("RC37-V refuses browser capture and every unapproved DSN destination", () => {
  assert.equal(
    getQaSentryOptions({
      ...validEnv,
      NEXT_PUBLIC_SENTRY_DSN: validEnv.SENTRY_DSN,
    }),
    null,
  );
  for (const dsn of [
    validEnv.SENTRY_DSN.replace("https:", "http:"),
    validEnv.SENTRY_DSN.replace("4512510799577088", "123"),
    validEnv.SENTRY_DSN.replace(".ingest.us.sentry.io", ".example.invalid"),
    validEnv.SENTRY_DSN + "?secret=x",
    validEnv.SENTRY_DSN + "#fragment",
  ]) {
    assert.equal(getQaSentryOptions({ ...validEnv, SENTRY_DSN: dsn }), null);
  }
});
test("RC37-V disables independent SDK channels and automatic integrations", () => {
  const options = getQaSentryOptions(validEnv)!;
  assert.equal(options.defaultIntegrations, false);
  assert.deepEqual(options.integrations, []);
  assert.equal(options.dataCollection?.userInfo, false);
  assert.equal(options.dataCollection?.cookies, false);
  assert.deepEqual(options.dataCollection?.httpBodies, []);
  assert.equal(options.sendClientReports, false);
  assert.equal(options.enableOpenTelemetrySetup, false);
  assert.equal(options.tracesSampleRate, 0);
  assert.equal(options.profileSessionSampleRate, 0);
  for (const name of [
    "beforeBreadcrumb",
    "beforeSendTransaction",
    "beforeSendLog",
    "beforeSendMetric",
  ] as const) {
    assert.equal(
      (options[name] as (value: unknown) => unknown)({ secret: marker }),
      null,
    );
  }
});
test("RC37-V real SDK 11.20.0 capture reaches only the sanitized transport, including attached scope", async () => {
  assert.equal(Sentry.SDK_VERSION, "11.20.0");
  const { sent, transport } = recorder();
  const client = new Sentry.NodeClient({
    ...getQaSentryOptions(validEnv)!,
    transport: () => transport,
    integrations: [],
    stackParser: Sentry.defaultStackParser,
  });
  try {
    const scope = new Sentry.Scope();
    scope.setUser({ email: `${marker}@example.invalid` });
    scope.setExtra("clinical", marker);
    scope.addAttachment({ filename: marker, data: marker });
    client.captureException(new Error(marker), {}, scope);
    await client.flush(2000);
    assert.equal(sent.length, 1);
    assert.equal(sent[0][1].length, 1);
    assert.equal(JSON.stringify(sent).includes(marker), false);
    assert.equal(sent[0][1][0][0].type, "event");
    // Sessions bypass beforeSend; the final transport must still reject them.
    await client.sendEnvelope([
      {},
      [[{ type: "session" }, { attrs: { release: marker } }]],
    ] as unknown as Envelope);
    assert.equal(sent.length, 1);
  } finally {
    await client.close(2000);
  }
});
