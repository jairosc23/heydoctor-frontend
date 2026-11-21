import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { QA, authorize, preflight, publicReturnReady, digest, verifyEvidence, verifySession, stripeRead, checkoutSessionId, RUNTIME_PROBE } from "./rc12-stripe-preflight.mjs";
import { paymentState, clinicalState, observeThenAct } from "./rc12-stripe-state.mjs";

// Offline contract fixtures ONLY. No real keys, SSH, provider API or payment.
const env = { RC12_AUTHORIZE_TEST_CHECKOUT: "STRIPE_TEST_ONLY_15000_CLP", E2E_BASE_URL: QA.app,
  GITHUB_SHA: "a".repeat(40), STRIPE_QA_TEST_SECRET_KEY: "sk_test_OFFLINE",
  STRIPE_QA_WEBHOOK_SECRET: "whsec_OFFLINE", STRIPE_QA_WEBHOOK_ID: "we_OFFLINE",
  E2E_DOCTOR_EMAIL: "rc18.doctor@heydoctor.invalid", E2E_DOCTOR_PASSWORD: "OFFLINE_ONLY",
  E2E_CONSULTATION_PAYMENT: "aaaaaaaa-1111-4111-8111-111111111111" };
const base = { project: QA.project, environment: QA.environment, deployment: "offline-deployment", guard: "qa-isolated" };
const backend = { ...base, service: QA.backend, sha: QA.backendSha, keyTest: true,
  keyDigest: digest(env.STRIPE_QA_TEST_SECRET_KEY), webhookPresent: true, webhookDigest: digest(env.STRIPE_QA_WEBHOOK_SECRET),
  flags: true, db: true, redis: true, amount: 15000, frontend: QA.app, backend: QA.api };
const frontend = { ...base, service: QA.frontend, sha: env.GITHUB_SHA, app: QA.app, api: QA.api, edge: true };
const endpoints = { has_more: false, data: [{ id: "we_OFFLINE", status: "enabled", livemode: false,
  url: `${QA.api}/api/payments/webhook/stripe`, enabled_events: ["checkout.session.completed", "payment_intent.succeeded"] }] };
const evidence = (b = backend, f = frontend, balance = { livemode: false }, e = endpoints) =>
  verifyEvidence(env, b, f, { id: QA.account }, balance, e);
const id = "aaaaaaaa-1111-4111-8111-111111111111";
const session = { id: "cs_test_OFFLINE", livemode: false, mode: "payment", client_reference_id: id,
  metadata: { paymentId: id, clinicId: QA.clinic, channel: "consultation" }, amount_total: 15000, currency: "clp",
  success_url: `${QA.api}/api/r/pay/${id}`, cancel_url: `${QA.api}/api/r/pay/${id}`, status: "open", payment_status: "unpaid" };

test("explicit authorization, exact QA origin and Test key are mandatory", () => {
  for (const patch of [{ RC12_AUTHORIZE_TEST_CHECKOUT: "" }, { STRIPE_QA_TEST_SECRET_KEY: "sk_live_OFFLINE" },
    { E2E_BASE_URL: "https://app.heydoctor.health" }, { GITHUB_SHA: "" }, { STRIPE_QA_WEBHOOK_SECRET: "" },
    { E2E_DOCTOR_PASSWORD: "" }, { E2E_DOCTOR_EMAIL: "real@example.com" }, { E2E_CONSULTATION_PAYMENT: "" }]) {
    assert.throws(() => authorize({ ...env, ...patch }));
  }
});
test("independent proof pairs effective runtime keys and exact SHA", () => {
  assert.equal(evidence().testMode, true);
  for (const patch of [{ service: "production" }, { environment: "other" }, { sha: "wrong" },
    { keyDigest: "mismatch" }, { webhookDigest: "mismatch" }, { db: false }, { redis: false }, { flags: false },
    { amount: 15001 }, { frontend: "https://app.heydoctor.health" }]) assert.throws(() => evidence({ ...backend, ...patch }));
  assert.throws(() => evidence(backend, { ...frontend, sha: "wrong" }));
  assert.throws(() => evidence(backend, frontend, { livemode: true }));
});
test("legacy staging, additional destinations, Live and incomplete inventories fail closed", () => {
  const endpoint = endpoints.data[0];
  for (const e of [{ has_more: true, data: endpoints.data }, { has_more: false, data: [] },
    { has_more: false, data: [endpoint, { ...endpoint, id: "we_OTHER" }] },
    { has_more: false, data: [{ ...endpoint, livemode: true }] },
    { has_more: false, data: [{ ...endpoint, url: "https://staging-api.heydoctor.health/api/payments/webhook/stripe" }] }]) {
    assert.throws(() => evidence(backend, frontend, { livemode: false }, e));
  }
});
test("Stripe wrapper is GET-only, refuses redirects/errors and never calls with Live", async () => {
  let calls = 0;
  const fetcher = async (url, options) => { calls++; assert.equal(options.method, "GET");
    assert.equal(options.redirect, "error"); assert.ok(url.startsWith("https://api.stripe.com/v1/"));
    return { ok: true, json: async () => ({ livemode: false }) }; };
  await stripeRead("/balance", env, fetcher);
  await assert.rejects(stripeRead("/payment_intents", env, fetcher));
  await assert.rejects(stripeRead("/balance", { ...env, STRIPE_QA_TEST_SECRET_KEY: "sk_live_OFFLINE" }, fetcher));
  assert.equal(calls, 1);
  await assert.rejects(stripeRead("/balance", env, async () => ({ ok: false })));
});
test("session evidence rejects wrong clinic, amount, return, Live and fabricated paid", () => {
  verifySession(session, id, session.id);
  assert.equal(checkoutSessionId(`https://checkout.stripe.com/c/pay/${session.id}`), session.id);
  for (const url of ["https://evil.test/c/pay/cs_test_OFFLINE", "https://checkout.stripe.com/c/pay/cs_live_OFFLINE"]) assert.throws(() => checkoutSessionId(url));
  for (const patch of [{ livemode: true }, { amount_total: 1 }, { status: "complete", payment_status: "paid" },
    { metadata: { ...session.metadata, clinicId: "other" } }, { success_url: "https://app.heydoctor.health" }]) {
    assert.throws(() => verifySession({ ...session, ...patch }, id, session.id));
  }
  assert.throws(() => verifySession(session, id, session.id, true));
  verifySession({ ...session, status: "complete", payment_status: "paid" }, id, session.id, true);
});
test("runtime probe returns only sanitized evidence, not secret or connection values", () => {
  const output = execFileSync(process.execPath, ["-e", RUNTIME_PROBE], { encoding: "utf8", env: {
    STRIPE_SECRET_KEY: env.STRIPE_QA_TEST_SECRET_KEY, STRIPE_WEBHOOK_SECRET: env.STRIPE_QA_WEBHOOK_SECRET,
    DATABASE_URL: "postgres://offline:OFFLINEPASSWORD@qa.railway.internal/qa", RC17_EXPECTED_POSTGRES_HOST: "qa.railway.internal",
  } });
  assert.ok(!output.includes(env.STRIPE_QA_TEST_SECRET_KEY));
  assert.ok(!output.includes(env.STRIPE_QA_WEBHOOK_SECRET));
  assert.ok(!output.includes("OFFLINEPASSWORD"));
  const record = JSON.parse(output.trim().slice("RC12_RUNTIME=".length));
  assert.equal(record.keyDigest, digest(env.STRIPE_QA_TEST_SECRET_KEY));
  assert.equal(record.db, true); assert.equal(record.redis, false);
});
test("unauthorized preflight stops before needing any CLI or network access", async () => {
  await assert.rejects(preflight({}), /RC12_BLOCKED:authorization/);
});
test("missing integration return route blocks before checkout without cookies", async () => {
  await publicReturnReady(async (url, options) => {
    assert.equal(url, `${QA.app}/payments/return`); assert.equal(options.credentials, "omit");
    assert.equal(options.method, "GET"); assert.equal(options.redirect, "error");
    return { ok: true, text: async () => '<div data-testid="clinical-payment-return">Verificando pago</div>' };
  });
  await assert.rejects(publicReturnReady(async () => ({ ok: false })));
  await assert.rejects(publicReturnReady(async () => ({ ok: true, text: async () => "not found" })));
});
test("pending and delayed outbox remain non-terminal until persisted PAID/LOCKED", () => {
  assert.deepEqual(["pending", "pending", "paid"].map((status) => paymentState({ paymentId: id, status }, id)), ["pending", "pending", "paid"]);
  assert.deepEqual(["SIGNED", "signed", "LOCKED"].map((status) => clinicalState({ data: { id, status } }, id)), ["signed", "signed", "locked"]);
  for (const status of ["failed", "cancelled", "expired", "success", "mock"]) assert.throws(() => paymentState({ paymentId: id, status }, id));
  assert.throws(() => paymentState({ paymentId: "other", status: "paid" }, id));
  assert.throws(() => clinicalState({ id, status: "draft" }, id));
  assert.throws(() => clinicalState({ id: "other", status: "locked" }, id));
});
test("even an immediate response sees all observers armed before the action", async () => {
  const resolvers = []; const order = [];
  const observations = [0, 1, 2].map((n) => () => new Promise((resolve) => { order.push(n); resolvers.push(resolve); }));
  const result = await observeThenAct(observations, () => {
    assert.deepEqual(order, [0, 1, 2]); resolvers.forEach((resolve, n) => resolve(n)); return "action";
  });
  assert.deepEqual(result, [0, 1, 2, "action"]);
  await assert.rejects(observeThenAct([() => Promise.reject(new Error("HTTP 500"))], () => undefined));
  await assert.rejects(observeThenAct([() => Promise.resolve()], () => { throw new Error("click failed"); }));
});
