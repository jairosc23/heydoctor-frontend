# RC12 — frontend clinical Stripe integration

Based on frontend `c307f54574bb3925b7cb0b2115a14e8bce7afe74`.
Backend contract audited at `35216b4f2670c1e585452b793c7f613c1a37ef9a`.
No backend, flags, credentials, deployment or production changes.

## Contract

- Clinical session creation: `POST /payments/create-payment-session` with
  `consultationId`. Consultation-wide persisted status:
  `GET /payments/consultation/:id/payment-status`.
- `/r/pay/:id` returns to `/payments/return#paymentId`.
- The return screen validates a bare UUID v4 and reads
  `GET /payments/intents/:id` using the existing authenticated API client.
  Despite the controller name, `PaymentIntentService.getStatus` loads the shared
  Payment row via `loadOwnedPayment`, without restricting it to Payment Element.
  It enforces clinic and owner/admin authorization and returns the persisted
  paymentId/status. It does not confirm/cancel/retrieve a provider transaction.
- The return screen also checks the response paymentId matches the fragment.
  Pending, paid, failed, cancelled and expired are distinct persisted outcomes.
  Missing auth, invalid/mismatched data, unknown status and API errors fail closed.
- Refresh is an explicit read, with no polling or automatic payment retry.
  Responses are bound to user, clinic, transaction and refresh generation; stale
  responses cannot overwrite a later fragment, account or logout.
- No URL query/fragment changes payment or consultation status. Approved payment
  is not a claim that asynchronous clinical locking is already finished. The
  consultation continues to load its own persisted status through the backend.

Backend evidence:
[authenticated controller](https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/blob/35216b4f2670c1e585452b793c7f613c1a37ef9a/heydoctor-backend-pro/src/payments/payment-element.controller.ts),
[shared-row ownership/status lookup](https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/blob/35216b4f2670c1e585452b793c7f613c1a37ef9a/heydoctor-backend-pro/src/payments/payment-intent.service.ts).

## Relationship to PR #140

[PR #140](https://github.com/jairosc23/heydoctor-frontend/pull/140) remains the
separate P0-4 executable contract and safety gate. This PR does not incorporate
its test diff or authorize its execution. Its return expectation must observe
the exact `/payments/intents/:paymentId` response used by this screen, rather
than the consultation-wide aggregate. Arm checkout response, return navigation
and payment response observers before clicking Confirmar pago, await them
together and compare the returned fragment/row to the created paymentId.
After reopening the encounter, require persisted consultation status LOCKED in
addition to disabled treatment/payment UI. Never use a success query parameter,
fixed sleep, added retry or skipped payment assertion to make the gate pass.

## Security matrix

| Control | Evidence / state |
| --- | --- |
| Payment/consultation authority | Backend remains SSOT; return has GET operations only |
| Authentication | Waits for AuthProvider; shared authenticated API client; no credential extraction |
| Tenant/owner access | Existing backend `loadOwnedPayment`; frontend does not override permissions |
| Untrusted URL | Bare UUID v4 only; result requires matching persisted response |
| Race isolation | Fragment/account/logout/refresh integration tests |
| Failure visibility | Pending/rejected/error remain visible; no fabricated success or automatic charge |
| Stripe Test keys / QA-only webhook / signing-secret pairing | Not demonstrated; transaction gate BLOCKED |
| Webhook/outbox/idempotent SIGNED→LOCKED runtime | Not run; requires specific authorization and evidence |

## Validation and remaining release gates

Unit tests cover reference validation and persisted status mapping. Component
integration tests exercise the real return page plus payment service against a
mocked HTTP-client boundary, including paths, auth, errors, races and no mutations.
These are isolated tests, not a claim of real Stripe delivery or backend RBAC QA.
Validation on the final change: TypeScript PASS; repository lint (`tsc --noEmit`)
PASS; optimized build PASS with `/payments/return` present; 1,817/1,817 unit tests
PASS, zero skips; 25/25 component/integration and signature regression tests PASS.
The build tool reports a security advisory for the unchanged baseline Next.js
16.4.3; no dependency upgrade or configuration bypass is included. Review that
separate risk before launch. No payment or E2E was executed by these validations.

RC12 remains incomplete until the separately authorized exact-SHA QA run proves
Stripe Test Mode, QA-only signed webhook delivery, persisted PAID, processed
outbox/accounting, idempotent replay and clinical SIGNED→LOCKED. AGENDA-04 manual
evidence is preserved; agenda automation and AUTH-01 are not recertified here.
