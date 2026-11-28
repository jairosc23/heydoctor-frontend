import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeSentryEvent } from "./sentry-privacy-gate";

test("RC37-V drops all PHI and auth context including arbitrary fields", () => {
  const secret = "SUPER_SECRET_TOKEN_123";
  const sensitive = {
    event_id: "a".repeat(32),
    timestamp: 1795880000,
    message: `Patient info ${secret}`,
    request: {
      url: `https://example.test/?token=${secret}`,
      headers: { authorization: `Bearer ${secret}` },
      data: { patient: "patient-name-private" },
    },
    breadcrumbs: [{ message: `clinical breadcrumb ${secret}` }],
    exception: { values: [{ value: `secret exception ${secret}` }] },
    user: { email: "private@example.test" },
    tags: { clinical: `diagnosis ${secret}` },
    extra: { customSensitiveField: `nested ${secret}` },
    contexts: { state: { opaque: `value ${secret}` } },
  };
  const output = sanitizeSentryEvent(sensitive as never);
  const serialized = JSON.stringify(output);
  for (const forbidden of [secret, "patient-name-private", "private@example.test",
    "diagnosis", "clinical breadcrumb", "token=", "Bearer"]) {
    assert.equal(serialized.includes(forbidden), false, `leaked ${forbidden}`);
  }
  assert.equal(output.event_id, "a".repeat(32));
  assert.equal(output.message, "HeyDoctor QA sanitized diagnostic event");
  assert.equal(Object.keys(output).sort().join(","), "event_id,fingerprint,level,message,tags,timestamp");
});

test("RC37-V does not trust malformed event ids, timestamps or levels", () => {
  const output = sanitizeSentryEvent({
    event_id: "token-instead-of-id",
    timestamp: Number.NaN,
    level: "fatal",
    message: "patient-data",
  } as never);
  assert.equal(output.event_id, undefined);
  assert.equal(output.timestamp, undefined);
  assert.equal(output.level, "error");
  assert.equal(JSON.stringify(output).includes("patient-data"), false);
});
