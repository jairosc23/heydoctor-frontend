# Commercial Settlement Workflow — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-24  
**Domain:** Commercial Settlement  
**Official identity:** `SettlementId`  
**Branch:** `feat/phase-19a-clinical-workspace-closure`

`SettlementId` is the official identity of the commercial domain. It is independent of `ClinicalActId`. `CorrelationId` remains reserved for observability and tracing. It is not the identity of a Settlement, Encounter, or clinical act.

Encounter states are unchanged: `draft → in_progress → completed → signed → locked`.  
Commercial states: `pending → payment_initiated → payment_verified → invoiced → locked`.

## Official identity table

| Identity | Domain | Role |
|----------|--------|------|
| `EncounterId` | Encounter | Canonical identity of one Encounter (`consultation.id`) |
| `ClinicalActId` | Clinical Completion | Canonical identity of one clinical act |
| `SettlementId` | Commercial Settlement | Canonical identity of one commercial settlement. Bound to exactly one Encounter |
| `CorrelationId` | Observability | Tracing only. Never a business identity |

## Certification

| ID | Result |
|----|--------|
| CS-1 | PASS |
| CS-2 | PASS |
| CS-3 | PASS |
| CS-4 | PASS |
| CS-5 | PASS |
| CS-6 | PASS |
| CS-7 | PASS |
| CS-8 | PASS |
| CS-9 | PASS |
| CS-10 | PASS |
| CS-11 | PASS |

## Frozen invariants

Do not modify this domain without:

1. An independent incident.
2. Explicit authorization.
3. A new certification.

Frozen:

- Settlement lifecycle
- Payment verification
- Invoice
- Lock observation
- Idempotency
- Referential integrity (CS-9)
- Transactional integrity (CS-10)
- Auditability (CS-11): Encounter → Payment Session → Payment Verification → Invoice → Lock

## Frozen surfaces

- `lib/commercial-settlement/**`
- `app/panel/consultas/[id]/_components/chart/CommercialSettlementSection.tsx`
- Commercial Settlement mount in `EncounterClosureSection.tsx` (sibling after Clinical Completion; the Clinical Completion mount remains frozen separately)

RC-19A Sprint 1, Sprint 2, and Clinical Completion remain CERTIFIED and frozen. Auth, Workspace chrome, Clinical Foundation, Branding, WebRTC, and the patient portal remain out of this domain.

Wait for authorization before opening the next functional front. Do not write product code while waiting.
