# RC12 — consultation payment contract (draft, certification BLOCKED)

Audit date: 2026-11-21. Frontend baseline: `c307f54574bb3925b7cb0b2115a14e8bce7afe74`.
Backend baseline: `35216b4f2670c1e585452b793c7f613c1a37ef9a`.
This change does not authorize a payment, configuration change or deployment.
AGENDA-04 manual create/edit/cancel PASS is preserved; its CI automation remains separate.

## Canonical clinical path, verified in source

1. `lib/encounter/encounter-action-registry.ts` exposes `encounter-pay-trigger`.
   `app/panel/consultas/[id]/_components/EncounterHeader.tsx` confirms the action.
   `app/panel/consultas/[id]/page.tsx:executePaymentToProvider` invokes
   `lib/services/payments.ts:createPaymentSession`, then navigates to `paymentUrl`.
2. Backend `src/payments/payment-sessions.controller.ts` exposes authenticated
   `POST /api/payments/create-payment-session` and
   `GET /api/payments/consultation/:id/payment-status`.
   `PaymentSessionService.createPaymentSession` checks clinic and consultation
   access, requires COMPLETED or SIGNED, rejects existing pending/paid payments,
   persists PENDING and calls `BillingService.createProviderCheckout` with
   `channel: consultation` and `consultationId`.
3. `BillingModule -> PaymentsModule -> PAYMENT_GATEWAY -> StripeAdapter` is the
   actual consultation dependency chain, not merely a general-payments assumption.
   Stripe Checkout uses `paymentId` as its API idempotency key.
4. Return: backend `/r/pay/:id` relays to `${FRONTEND_URL}/payments/return#<paymentId>`.
   This is navigation only; it cannot prove payment success.
5. `/api/payments/webhook/stripe` requires raw body and Stripe-Signature.
   `StripeAdapter.constructWebhookEvent` verifies the signing secret.
   `StripeWebhookService` locks the payment row, checks the transition and amount,
   persists PAID/provider event metadata, and inserts PAYMENT_SUCCEEDED outbox
   with a deterministic key and ON CONFLICT DO NOTHING. Final-state replays
   return `already_final`; the webhook does not directly lock the consultation.
6. `EventOutboxService` posts accounting and calls
   `lockSignedConsultationAfterPaymentWithManager`. Only SIGNED becomes LOCKED.
   Completed-but-unsigned payment is therefore not sufficient for P0-4.
   `ConsultationsService` rejects edits/deletes of LOCKED consultations.
7. `PaymentReconciliationService.reconcileDay` aggregates persisted payments and
   subscriptions. It is a daily financial reconciliation, not a replacement for
   webhook verification or a synchronous proof of a clinical payment.
   Legacy table names `payku_payments` do not identify the active provider.

Backend references (all at the pinned SHA):
- [Clinical session service](https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/blob/35216b4f2670c1e585452b793c7f613c1a37ef9a/heydoctor-backend-pro/src/payments/payment-session.service.ts)
- [Stripe webhook](https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/blob/35216b4f2670c1e585452b793c7f613c1a37ef9a/heydoctor-backend-pro/src/payments/stripe-webhook.service.ts)
- [Outbox and clinical lock](https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/blob/35216b4f2670c1e585452b793c7f613c1a37ef9a/heydoctor-backend-pro/src/outbox/event-outbox.service.ts)
- [Reconciliation](https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/blob/35216b4f2670c1e585452b793c7f613c1a37ef9a/heydoctor-backend-pro/src/payments/payment-reconciliation.service.ts)

## Demonstrated blockers at the frontend baseline

- `lib/services/payments.ts` still POSTs `/payku/create-payment-session` and GETs
  `/payku/consultation/:id/payment-status`; `next.config.mjs` rewrites the prefix
  `/hd-api` to `/api` but does not translate `/payku` to `/payments`.
- `/payments/return` is absent from this frontend tree. `/payment-success` handles
  PRO subscriptions, not this clinical return. Do not substitute it.
- P0-4's old URL regex matched `/consultas` before leaving the encounter and
  then skipped because `payment=success` was absent. The green job did not prove
  checkout, return, payment persistence or clinical locking.
- The clinical confirmation panel still labels the provider Payku.
- Railway qa-isolated predeploy guard requires payment mocks false, Payku disabled
  and no STRIPE_SECRET_KEY. The returned variable names contain no Stripe test
  key or webhook signing-secret configuration. OAuth does not expose values;
  runtime Test Mode is NOT VERIFIED. The guard's Stripe flags are not proof
  that the clinical checkout service reads/enforces those flags.

## Scope of this draft

Only P0-4 is reconciled: explicit Stripe checkout/return contracts, persisted
payment-status response, required clinical lock assertions and no successful skip.
It fails before checkout unless `E2E_STRIPE_TEST_PAYMENT_AUTHORIZED=1` is explicitly
provided for a separately approved run. This switch is authorization, not safety
evidence. It is deliberately not enabled or wired into CI by this PR.
There is no payment-method entry/confirmation driver in this change. Hosted
Checkout completion must be separately authorized and implemented/operated against
the verified Test session; a headless unattended run cannot complete that step yet.
No product routes, flags, backend, credentials, retries or certified modules change.
Known product-contract blockers remain visible rather than being patched in a test.

## Mandatory safety gate BEFORE authorizing any transaction

Record sanitized, current evidence; no secret values, cookies, raw card data,
checkout capability URLs or clinical data in reports/traces.

| Control | Required proof | Current status |
| --- | --- | --- |
| Environment | Exact frontend/backend SHA; isolated QA clinic, Postgres, Redis | QA source/config identified; no new runtime DB access |
| Keys | Secure runtime inspection reports Test key class only; Stripe account/sandbox metadata consistent | BLOCKED, no demonstrated Test key |
| Provider | Consultation checkout resolves Stripe; Checkout Session and related intent `livemode=false` | Source PASS; runtime BLOCKED |
| Webhook destination | Enabled Test destination is exactly QA backend `/api/payments/webhook/stripe`; no production delivery destination/forwarder for these events | NO VERIFICABLE |
| Signing secret | Correct QA endpoint signing secret configured and verification succeeds | NO VERIFICABLE |
| Return | Backend/frontend origins point only to QA; implemented clinical return route | BLOCKED at frontend baseline |
| Side effects | No live keys, Connect payout/transfer, real emails, fake payment fallback or production access | Config guard present; effective runtime proof required |

Stripe requires test keys and official test methods; see
https://docs.stripe.com/testing and https://docs.stripe.com/webhooks.
Do not enable Payku, alter the current payment guard or populate credentials under
this PR. Any required QA configuration or deployment needs specific authorization.

## Mandatory certification evidence (UI PASS alone is insufficient)

After fixing the demonstrated application routes through a separate reviewed change,
approving its QA deployment and completing the safety gate:

1. Use a fresh synthetic SIGNED consultation in the RC18 doctor's clinic. Preserve
   signed prior fixtures and the cancelled AGENDA-04 evidence; no SQL state resets.
2. With specific transaction authorization, exercise the real clinical trigger,
   canonical session POST, hosted Stripe Test checkout and `/r/pay/:id` return.
   Use official test methods only. Capture sanitized IDs, not payment URLs/secrets.
3. Correlate one paymentId, consultationId, Checkout Session, PaymentIntent and
   provider event in Stripe Test and the backend. Require `livemode=false`, verified
   webhook delivery/2xx, correct amount/currency/clinic and persisted PAID/paidAt.
   GET payment-status must be authenticated and return `isPaid=true`.
4. Prove PAYMENT_SUCCEEDED outbox processing, exactly one accounting effect, signed
   consultation LOCKED and disabled treatment/payment UI after a fresh reload.
5. With explicit webhook-replay authorization, redeliver the SAME real Stripe Test
   event to QA. Require duplicate/already_final evidence, unchanged paidAt and
   accounting totals, one logical outbox effect and one clinical lock transition.
   Do not generate a fabricated success payload or sign a synthetic success event.
6. Preserve source CI evidence for invalid signature/amount, cross-clinic access,
   duplicate/final-state webhook handling and outbox idempotency. Source unit tests
   are not runtime proof of delivery, Test Mode or end-to-end idempotency.
7. Run the approved exact-SHA gate and distinguish executed/failed/skipped tests.
   P0-4 UI assertions plus the independent webhook/replay evidence are both required.
   AGENDA-04 CI automation and AUTH-01 reproducibility remain separate open controls.

No new transaction, replay, CI E2E or deployment was executed during this audit.
RC12 remains BLOCKED until all mandatory evidence is present.
