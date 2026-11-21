# RC12 — opt-in Stripe Test P0-4 executor

Stacked on PR #140 head `9e21f934`; application prerequisite is separate PR #141
head `423a799f`. No application/backend code, Stripe resources, secrets, flags,
deployments or production configuration change here. No Checkout was executed.

## Gate and execution

The dedicated workflow `RC12 Stripe P0-4 (explicit Test authorization)` has only
`workflow_dispatch`. Default `NO_TRANSACTION` runs offline quality only. A future
owner-authorized dispatch must explicitly select `STRIPE_TEST_ONLY_15000_CLP`.
It runs only P0-4, with one worker, zero retries and a finite overall timeout.
Do not dispatch that authorization as part of reviewing this PR.
GitHub requires a dispatch workflow to be published on the default branch before
it can be dispatched on a candidate ref. Publication/review is a separate approval
gate; this PR does not publish or merge the workflow into that branch.

The preflight uses a pinned Railway CLI to run an environment-only Node probe via
authorized SSH in the two exact QA services. It imports no app, connects to no DB,
and writes nothing remotely. SSH errors, unavailable permissions, missing metadata
or secrets cause BLOCKED; there is no OAuth-value or manual-attestation fallback.
It compares effective runtime key/signing-secret SHA-256 fingerprints to protected
CI references without printing values or storing fingerprints in reports.
Project/environment/service/deployment/SHA/origins, private DB/Redis host identity,
15000 CLP limit, disabled Live/Connect/Payku/mocks/email controls must all match.
The frontend runtime SHA must equal `GITHUB_SHA`, so an independently reviewed
combined candidate including #141 and this executor must be deployed first under
separate authorization. No merge or deployment is performed by this workflow.
An anonymous GET also requires the deployed #141 return-screen marker before
creating checkout. Missing auth secrets fail in global setup before the shared
fixture can skip; the workflow additionally rejects missing/skipped JUnit coverage.

Independent Stripe GETs verify the account, Test balance mode and complete webhook
destination inventory. Exactly one enabled Test destination must match QA and the
configured endpoint ID. Existing legacy staging destinations block this gate.
No endpoint is created/edited and no test event/replay is sent by the preflight.
Matching runtime/CI signing-secret fingerprints prove configuration consistency,
not actual signature verification: genuine delivery evidence remains mandatory.

Before creating checkout the test runs the preflight again. Before filling any
financial field it repeats the preflight, retrieves the Test Checkout Session
through Stripe GET, and requires matching payment/clinic/channel, amount/currency,
open/unpaid state and exact QA success/cancel URLs. Only then does it use the
official public Test card, synthetic identity and one hosted submit. Unknown or
changed Stripe UI/fields fail closed, never switch to an API-confirmation shortcut.
The actual hosted form has not been exercised by the offline validation.

All navigation/HTTP observers are registered before the triggering confirmation.
Pending return uses the product's authenticated Actualizar estado action and a
bounded state poll. HTTP errors and rejected/unknown/mismatched states fail.
The clinical outbox wait reopens the encounter through the app until the persisted
GET reports LOCKED; SIGNED may remain temporarily while outbox processing finishes.
There is no SQL, fabricated webhook, client lock, fixed sleep or financial retry.

## Required references (not created or changed by this PR)

- Existing `E2E_DOCTOR_EMAIL`, `E2E_DOCTOR_PASSWORD`, `E2E_CONSULTATION_PAYMENT`.
- `STRIPE_QA_TEST_SECRET_KEY`: protected existing Test key reference, never Live.
- `STRIPE_QA_WEBHOOK_SECRET`: protected matching QA signing-secret reference.
- Repository variable `STRIPE_QA_WEBHOOK_ID`: the approved QA destination ID.
- `RAILWAY_API_TOKEN_QA`: legitimate existing SSH-capable account/workspace access.
  Do not grant new permissions or create a token just to satisfy a failed gate.

The current QA guard rejecting Stripe keys and the legacy webhook destination
remain known blockers until specifically authorized configuration work is completed.
Do not copy keys into files, command arguments, logs, screenshots or PRs.

## Security matrix

| Control | Enforcement / evidence |
| --- | --- |
| Authorization | Explicit dispatch, default no transaction; required again in preflight |
| Independent Test proof | Effective runtime fingerprint pairing + Stripe GET balance/session livemode=false |
| QA isolation | Fixed resource IDs, exact deployed frontend SHA, backend baseline and QA-only origins/destination |
| Wrong amount, clinic or return | Rejected before card entry by authoritative Session GET |
| Pending/declined/error | Authenticated persisted-row reads; failures are not skipped |
| Outbox delay | Bounded SIGNED→LOCKED state wait; fresh clinical GET plus disabled UI |
| Duplicate charge risk | One submit, zero retries, serialized workflow; existing backend pending/paid guards |
| Evidence privacy | No trace/video/screenshots; only sanitized result/JUnit, no secrets or checkout URLs |
| Actual webhook/replay certificate | NOT RUN; a local PASS cannot close RC12 |

## Offline validation and final evidence

`node --test scripts/rc12-stripe-preflight.test.mjs` uses explicit OFFLINE fixture
values and dependency-injected fake GET responses; it never calls Stripe or SSH.
Tests cover denied authorization/Live/other origins, mismatched keys/SHA, incomplete
or nonexclusive destinations, amount/clinic/return/state mismatch, sanitized probe
output, pending/outbox states and observers armed before even an immediate response.
`playwright --list` validates discovery only, not execution or certification.
`node --import tsx --test scripts/rc12-stripe-executor.test.ts` calls both actual
executor entry points with no authorization and asserts zero browser interactions.
TypeScript, repository lint and build are also offline application checks.
Validated locally: 12/12 offline tests, TypeScript, repository lint, optimized
build, workflow YAML and discovery of exactly one P0-4: PASS. PR #141 applies
without conflicts to this stacked executor. The unchanged Next.js 16.4.3 baseline
still emits its previously documented security advisory; no upgrade or protection
bypass is included. Actual hosted Stripe UI, SSH preflight and provider delivery
were NOT exercised. No GitHub workflow was dispatched.

Final RC12 still needs an explicitly authorized deployed exact-SHA Test run, genuine
signed webhook delivery correlated to persisted PAID, processed outbox/accounting,
SIGNED→LOCKED, and a separately authorized SAME-event replay proving no duplicated
effects. This executor does not perform that replay or claim it has been proved.
AGENDA-04 and AUTH-01 remain outside this isolated payment executor.

References: https://docs.stripe.com/testing and https://docs.railway.com/cli/ssh.
