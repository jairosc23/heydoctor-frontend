import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

export const QA = Object.freeze({
  project: "69f7999d-03b2-4d08-9ca3-204b35ff6aae",
  environment: "df0bcfe1-7d25-4b71-982c-351623d99012",
  backend: "d2e8820a-f849-4ba8-a51e-e4d833d9fb99",
  frontend: "7dcdb503-2412-41f0-b339-17174df4aadb",
  backendSha: "35216b4f2670c1e585452b793c7f613c1a37ef9a",
  app: "https://heydoctor-frontend-rc17-qa-qa-isolated.up.railway.app",
  api: "https://heydoctor-backend-rc17-qa-qa-isolated.up.railway.app",
  account: "acct_1U9vSWF0JO4ODWl1",
  clinic: "70ba993c-636b-4f2e-a43f-d0810ee77094",
  amount: 15000,
});
export const digest = (value) => createHash("sha256").update(value).digest("hex");
export function requireCheck(value, code) { if (!value) throw new Error(`RC12_BLOCKED:${code}`); }

// Executed only by an explicitly dispatched future QA run. No DB connections,
// provider calls, files, application imports or mutations inside the runtime.
export const RUNTIME_PROBE = `const e=process.env,c=require('node:crypto');
const h=v=>c.createHash('sha256').update(v||'').digest('hex');
const host=(key,expected)=>{try{const u=new URL(e[key]);return u.hostname.endsWith('.railway.internal')&&u.hostname===e[expected]}catch{return false}};
console.log('RC12_RUNTIME='+JSON.stringify({project:e.RAILWAY_PROJECT_ID,environment:e.RAILWAY_ENVIRONMENT_ID,service:e.RAILWAY_SERVICE_ID,deployment:e.RAILWAY_DEPLOYMENT_ID,sha:e.RAILWAY_GIT_COMMIT_SHA,guard:e.RC17_ENVIRONMENT_GUARD,keyTest:/^sk_test_/.test(e.STRIPE_SECRET_KEY||''),keyDigest:h(e.STRIPE_SECRET_KEY),webhookPresent:/^whsec_/.test(e.STRIPE_WEBHOOK_SECRET||''),webhookDigest:h(e.STRIPE_WEBHOOK_SECRET),frontend:e.FRONTEND_URL,backend:e.BACKEND_PUBLIC_URL,api:e.NEXT_PUBLIC_HEYDOCTOR_API_URL,app:e.NEXT_PUBLIC_APP_URL,edge:['1','true'].includes(e.NEXT_PUBLIC_HD_API_EDGE),db:host('DATABASE_URL','RC17_EXPECTED_POSTGRES_HOST'),redis:host('REDIS_URL','RC17_EXPECTED_REDIS_HOST'),flags:['STRIPE_LIVE_ENABLED','STRIPE_CONNECT_ENABLED','ALLOW_FAKE_PAYMENTS','PUBLIC_BOOKING_MOCK_CHECKOUT_ENABLED','TRANSACTIONAL_EMAIL_QA_SEND'].every(k=>e[k]==='false')&&e.PAYKU_CONSULTATION_PAYMENTS_DISABLED==='true',amount:Number(e.CONSULTATION_PAYMENT_AMOUNT_CLP||15000)}));`;

function runtime(service) {
  let output;
  try {
    // Single shell-quoted command: probe contains no credentials or user input.
    const command = `node -e '${RUNTIME_PROBE.replaceAll("'", "'\\''")}'`;
    output = execFileSync(resolve("node_modules/.bin/railway"), ["ssh", "--project", QA.project,
      "--environment", QA.environment, "--service", service, "--", command],
    { encoding: "utf8", timeout: 45000, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 65536 });
  } catch { throw new Error("RC12_BLOCKED:runtime_read_unavailable"); }
  const line = output.split("\n").find((s) => s.startsWith("RC12_RUNTIME="));
  requireCheck(line, "runtime_evidence_missing");
  try { return JSON.parse(line.slice("RC12_RUNTIME=".length)); }
  catch { throw new Error("RC12_BLOCKED:runtime_evidence_invalid"); }
}

export function authorize(env) {
  requireCheck(env.RC12_AUTHORIZE_TEST_CHECKOUT === "STRIPE_TEST_ONLY_15000_CLP", "authorization");
  requireCheck(env.E2E_BASE_URL === QA.app, "qa_origin");
  requireCheck(/^[0-9a-f]{40}$/.test(env.GITHUB_SHA || ""), "exact_sha");
  requireCheck(/^sk_test_[A-Za-z0-9]+$/.test(env.STRIPE_QA_TEST_SECRET_KEY || ""), "test_key_required");
  requireCheck(/^whsec_[A-Za-z0-9]+$/.test(env.STRIPE_QA_WEBHOOK_SECRET || ""), "signing_secret_required");
  requireCheck(/^we_[A-Za-z0-9]+$/.test(env.STRIPE_QA_WEBHOOK_ID || ""), "destination_required");
  requireCheck(env.E2E_DOCTOR_EMAIL === "rc18.doctor@heydoctor.invalid" && Boolean(env.E2E_DOCTOR_PASSWORD?.trim()), "synthetic_auth_required");
  requireCheck(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(env.E2E_CONSULTATION_PAYMENT || ""), "synthetic_fixture_required");
}

/** Stripe reads only. No POST, test-event trigger, confirmation, replay or fallback. */
export async function stripeRead(path, env = process.env, fetcher = fetch) {
  requireCheck(/^sk_test_[A-Za-z0-9]+$/.test(env.STRIPE_QA_TEST_SECRET_KEY || ""), "test_key_required");
  requireCheck(/^\/(balance|account|webhook_endpoints|checkout\/sessions\/cs_test_[A-Za-z0-9]+)(\?.*)?$/.test(path), "read_path");
  let response;
  try {
    response = await fetcher(`https://api.stripe.com/v1${path}`, {
      method: "GET", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${env.STRIPE_QA_TEST_SECRET_KEY}` },
    });
    requireCheck(response.ok, "stripe_read_failed");
    return await response.json();
  } catch { throw new Error("RC12_BLOCKED:stripe_read_failed"); }
}

export function verifyEvidence(env, backend, frontend, account, balance, endpoints) {
  authorize(env);
  for (const [record, service] of [[backend, QA.backend], [frontend, QA.frontend]]) {
    requireCheck(record.project === QA.project && record.environment === QA.environment &&
      record.service === service && record.guard === "qa-isolated" && Boolean(record.deployment), "runtime_identity");
  }
  requireCheck(backend.sha === QA.backendSha && frontend.sha === env.GITHUB_SHA, "runtime_sha");
  requireCheck(backend.keyTest && backend.keyDigest === digest(env.STRIPE_QA_TEST_SECRET_KEY), "effective_test_key");
  requireCheck(backend.webhookPresent && backend.webhookDigest === digest(env.STRIPE_QA_WEBHOOK_SECRET), "effective_signing_secret");
  requireCheck(backend.flags && backend.db && backend.redis && backend.amount === QA.amount, "runtime_isolation");
  requireCheck(backend.frontend === QA.app && backend.backend === QA.api &&
    frontend.app === QA.app && frontend.edge === true && frontend.api?.replace(/\/api\/?$/, "") === QA.api, "runtime_origins");
  requireCheck(account.id === QA.account && balance.livemode === false, "stripe_test_account");
  requireCheck(Array.isArray(endpoints.data) && endpoints.has_more === false, "destinations_complete");
  const active = endpoints.data.filter((e) => e.status === "enabled");
  requireCheck(active.length === 1, "exclusive_destination");
  const endpoint = active[0];
  requireCheck(endpoint.id === env.STRIPE_QA_WEBHOOK_ID && endpoint.livemode === false &&
    endpoint.url === `${QA.api}/api/payments/webhook/stripe` &&
    ["checkout.session.completed", "payment_intent.succeeded"].every((e) => endpoint.enabled_events?.includes(e)), "qa_destination");
  return Object.freeze({ sha: env.GITHUB_SHA, backendDeployment: backend.deployment,
    frontendDeployment: frontend.deployment, checkedAt: Date.now(), account: account.id,
    webhook: endpoint.id, testMode: true });
}

export async function preflight(env = process.env) {
  authorize(env); // No SSH or Stripe call before explicit authorization.
  const backend = runtime(QA.backend);
  const frontend = runtime(QA.frontend);
  const [account, balance, endpoints] = await Promise.all([
    stripeRead("/account", env), stripeRead("/balance", env), stripeRead("/webhook_endpoints?limit=100", env),
  ]);
  const proof = verifyEvidence(env, backend, frontend, account, balance, endpoints);
  await publicReturnReady();
  return proof;
}

export async function publicReturnReady(fetcher = fetch) {
  try {
    const response = await fetcher(`${QA.app}/payments/return`, { method: "GET", credentials: "omit",
      redirect: "error", signal: AbortSignal.timeout(15000) });
    requireCheck(response.ok && (await response.text()).includes('data-testid="clinical-payment-return"'), "return_route");
  } catch { throw new Error("RC12_BLOCKED:return_route"); }
}

export function checkoutSessionId(url) {
  let parsed; try { parsed = new URL(url); } catch { throw new Error("RC12_BLOCKED:checkout_url"); }
  const id = parsed.pathname.match(/\/(cs_test_[A-Za-z0-9]+)(?:\/|$)/)?.[1];
  requireCheck(parsed.origin === "https://checkout.stripe.com" && id, "checkout_test_url");
  return String(id);
}
export function verifySession(session, paymentId, id, completed = false) {
  requireCheck(session.id === id && session.livemode === false && session.mode === "payment" &&
    session.client_reference_id === paymentId && session.metadata?.paymentId === paymentId &&
    session.metadata?.clinicId === QA.clinic && session.metadata?.channel === "consultation" &&
    session.amount_total === QA.amount && session.currency === "clp" &&
    session.success_url === `${QA.api}/api/r/pay/${paymentId}` &&
    session.cancel_url === `${QA.api}/api/r/pay/${paymentId}`, "checkout_correlation");
  requireCheck(completed ? session.status === "complete" && session.payment_status === "paid" :
    session.status === "open" && session.payment_status === "unpaid", "checkout_state");
}

if (process.argv[1] && resolve(process.argv[1]) === resolve("scripts/rc12-stripe-preflight.mjs")) {
  preflight().then((proof) => console.log(JSON.stringify({ RC12_STRIPE_PREFLIGHT: "PASS", ...proof })))
    .catch((error) => { console.error(/^RC12_BLOCKED:[a-z_]+$/.test(error.message) ? error.message : "RC12_BLOCKED:preflight"); process.exitCode = 1; });
}
