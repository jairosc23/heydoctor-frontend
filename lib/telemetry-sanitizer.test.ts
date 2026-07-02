import test from "node:test";
import assert from "node:assert/strict";
import {
  TELEMETRY_REDACTED,
  redactSensitiveString,
  sanitizeTelemetryValue,
} from "./telemetry-sanitizer";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

test("redactSensitiveString redacts JWT tokens", () => {
  const out = redactSensitiveString(`token=${SAMPLE_JWT}`);
  assert.ok(!out.includes("eyJhbGci"));
  assert.match(out, /\[REDACTED\]/);
});

test("redactSensitiveString redacts Bearer tokens", () => {
  const out = redactSensitiveString("Authorization: Bearer abc.def.ghi");
  assert.equal(out, "Authorization: [REDACTED]");
});

test("redactSensitiveString redacts email addresses", () => {
  const out = redactSensitiveString("contact patient@example.com today");
  assert.ok(!out.includes("patient@example.com"));
  assert.match(out, /\[REDACTED\]/);
});

test("redactSensitiveString redacts inline API keys", () => {
  const out = redactSensitiveString('config api_key="super-secret-key"');
  assert.ok(!out.includes("super-secret-key"));
  assert.match(out, /\[REDACTED\]/);
});

test("sanitizeTelemetryValue redacts sensitive object keys", () => {
  const out = sanitizeTelemetryValue({
    pathname: "/panel",
    cookie: "session=abc",
    authorization: "Bearer xyz",
    access_token: "tok",
    patient: { name: "Jane" },
  }) as Record<string, unknown>;

  assert.equal(out.pathname, "/panel");
  assert.equal(out.cookie, TELEMETRY_REDACTED);
  assert.equal(out.authorization, TELEMETRY_REDACTED);
  assert.equal(out.access_token, TELEMETRY_REDACTED);
  assert.equal(out.patient, TELEMETRY_REDACTED);
});

test("sanitizeTelemetryValue redacts JWTs embedded in string fields", () => {
  const out = sanitizeTelemetryValue({
    message: `failed with ${SAMPLE_JWT}`,
  }) as Record<string, unknown>;

  assert.ok(typeof out.message === "string");
  assert.ok(!(out.message as string).includes("eyJhbGci"));
});

test("sanitizeTelemetryValue serializes Error safely", () => {
  const out = sanitizeTelemetryValue({
    err: new Error(`leak ${SAMPLE_JWT}`),
  }) as Record<string, Record<string, string>>;

  assert.equal(out.err.name, "Error");
  assert.ok(!out.err.message.includes("eyJhbGci"));
});

test("sanitizeTelemetryValue detects circular object references", () => {
  const cyclic: Record<string, unknown> = { label: "root" };
  cyclic.self = cyclic;

  const out = sanitizeTelemetryValue(cyclic) as Record<string, unknown>;
  assert.equal(out.label, "root");
  assert.equal(out.self, "[Circular]");
});

test("sanitizeTelemetryValue detects circular array references", () => {
  const arr: unknown[] = [1];
  arr.push(arr);

  const out = sanitizeTelemetryValue(arr) as unknown[];
  assert.equal(out[0], 1);
  assert.equal(out[1], "[Circular]");
});

test("sanitizeTelemetryValue truncates very large arrays", () => {
  const huge = Array.from({ length: 10_000 }, (_, i) => i);
  const started = performance.now();
  const out = sanitizeTelemetryValue(huge) as unknown[];
  const elapsed = performance.now() - started;

  assert.ok(out.length <= 101);
  assert.match(String(out[out.length - 1]), /9900 more items/);
  assert.ok(elapsed < 500, `expected fast truncation, took ${elapsed}ms`);
});

test("sanitizeTelemetryValue truncates very large objects", () => {
  const huge: Record<string, number> = {};
  for (let i = 0; i < 1_000; i += 1) {
    huge[`key_${i}`] = i;
  }

  const started = performance.now();
  const out = sanitizeTelemetryValue(huge) as Record<string, unknown>;
  const elapsed = performance.now() - started;

  assert.ok(Object.keys(out).length <= 201);
  assert.match(String(out["...[truncated]"]), /800 more keys/);
  assert.ok(elapsed < 500, `expected fast truncation, took ${elapsed}ms`);
});

test("redactSensitiveString bounds oversized input before regex", () => {
  const jwtPad = "x".repeat(100_000);
  const payload = `${jwtPad} token=${SAMPLE_JWT}`;
  const started = performance.now();
  const out = redactSensitiveString(payload);
  const elapsed = performance.now() - started;

  assert.ok(out.includes("[input truncated]") || out.length <= 2_100);
  assert.ok(!out.includes("eyJhbGci"));
  assert.ok(elapsed < 200, `expected bounded work, took ${elapsed}ms`);
});

test("sanitizeTelemetryValue handles deeply nested structures", () => {
  let nested: Record<string, unknown> = { value: "leaf" };
  for (let i = 0; i < 10; i += 1) {
    nested = { child: nested };
  }

  const out = sanitizeTelemetryValue(nested) as Record<string, unknown>;
  let cursor: unknown = out;
  let depth = 0;
  while (
    cursor &&
    typeof cursor === "object" &&
    "child" in (cursor as Record<string, unknown>)
  ) {
    depth += 1;
    cursor = (cursor as Record<string, unknown>).child;
    if (cursor === "[MaxDepth]") break;
  }
  assert.ok(depth <= 5);
  assert.equal(cursor, "[MaxDepth]");
});

test("sanitizeTelemetryValue enforces global node budget on wide trees", () => {
  const wide: Record<string, unknown> = {};
  for (let i = 0; i < 5_000; i += 1) {
    wide[`n${i}`] = { v: i };
  }

  const started = performance.now();
  const out = sanitizeTelemetryValue(wide);
  const elapsed = performance.now() - started;

  const serialized = JSON.stringify(out);
  assert.ok(
    serialized.includes("[MaxNodes]") || serialized.includes("...[truncated]"),
  );
  assert.ok(elapsed < 1_000, `expected budget stop, took ${elapsed}ms`);
});
