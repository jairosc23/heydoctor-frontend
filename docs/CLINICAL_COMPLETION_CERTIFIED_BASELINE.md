# Clinical Completion Workflow — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-24  
**Domain:** Clinical Completion  
**Official identity:** `ClinicalActId`  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**SHA:** `7fcac05562174201b21c205a05b73f35b84f055d`

`CorrelationId` remains reserved for observability and tracing. It is not the identity of the clinical act.

## Certification

| ID | Result |
|----|--------|
| CC-1 | PASS |
| CC-2 | PASS |
| CC-3 | PASS |
| CC-4 | PASS |
| CC-5 | PASS |
| CC-6 | PASS |
| CC-7 | PASS |
| CC-8 | PASS |
| CC-9 | PASS |
| CC-10 | PASS |
| CC-11 | PASS |

## Frozen invariants

Do not modify without a new independent incident, explicit authorization, and a new `ClinicalActId` when the act would change after `document_ready`.

- States — Encounter: `draft → in_progress → completed → signed → locked`
- States — Completion: `pending → emitted \| no_medication → document_ready → delivered`
- Workflow (post-signature close through delivery)
- Idempotency
- Auditability (`ClinicalActId` chain)
- Resumption from persisted `document_ready` / `delivered`
- Immutability after `document_ready`

## Frozen surfaces

- `lib/clinical-completion/**`
- `lib/emission-pipeline/api.ts`
- `app/panel/consultas/[id]/_components/chart/ClinicalCompletionSection.tsx`
- Clinical Completion mount in `EncounterClosureSection.tsx`

RC-19A Sprint 1 and Sprint 2 remain CERTIFIED and frozen. Auth, Workspace chrome, Clinical Foundation, Branding, WebRTC, payments, and the patient portal remain out of this domain.
