# HeyDoctor — HIPAA Risk Register

Version 0.4 | 2026-09-07 | DRAFT — all risks OPEN

Method, evidence definitions and inventory: [risk analysis](hipaa-risk-analysis.md). Execution and closure workflow: [risk management plan](hipaa-risk-management-plan.md). Proposed role owners below are **not appointed individuals**: named owner and acceptance OPEN for every risk. No control is credited as production-verified. Each entry's current residual remains its initial score until evidence is reviewed. Target residual is conditional, not an accepted result; initial impact is retained and only likelihood is provisionally reduced pending effectiveness evidence. No exploitation is asserted. In each owner entry, the first role is the single proposed accountable role; following roles support delivery or review. Original MFA checkpoint was **NOT ACTIVATED**; see the 2026-09-08 follow-up before inferring current state; deployment assertions reflect session reports only, not live attestation.

## Summary

16 OPEN risks: **Critical 0 / High 13 / Medium 3 / Low 0**. Likelihood and impact are provisional 1–5 ratings; High 12–19, Medium 6–11. Scope and evidence gaps can change severity. No risk is CLOSED or ACCEPTED.

| Risk | Asset / flow | C/I/A | L | I | Initial score / current residual | Status |
|---|---|---|---|---|---|---|
| R01 | A01–A03 / staff login | C/I | 3 | 5 | 15 High | OPEN |
| R02 | A02–A04 / record and tenant access | C/I | 3 | 5 | 15 High | OPEN |
| R03 | A05 / AI inputs, outputs and derived stores | C/I | 3 | 5 | 15 High | OPEN |
| R04 | A03–A07 / security and clinical audit | C/I | 3 | 4 | 12 High | OPEN |
| R05 | A04, A08 / stored ePHI | C | 3 | 5 | 15 High | OPEN |
| R06 | A04, A08 / backup and restoration | I/A | 3 | 5 | 15 High | OPEN |
| R07 | A01–A10 / incident handling | C/I/A | 3 | 4 | 12 High | OPEN |
| R08 | A02, A04–A10 / vendors and subprocessors | C/I/A | 3 | 5 | 15 High | OPEN |
| R09 | A07 / telemetry and support exports | C | 3 | 4 | 12 High | OPEN |
| R10 | A01, A09 / endpoints and workforce | C/I | 3 | 4 | 12 High | OPEN |
| R11 | A01–A06, A10 / transmission and realtime | C/I | 3 | 4 | 12 High | OPEN |
| R12 | A03, A04, A09 / keys, privileged access and delivery | C/I/A | 3 | 5 | 15 High | OPEN |
| R13 | A01–A10 / ePHI retention and copies | C | 3 | 4 | 12 High | OPEN |
| R14 | A03–A05 / clinical record integrity | I | 2 | 4 | 8 Medium | OPEN |
| R15 | A03–A06 / runtime dependencies and availability | C/I/A | 2 | 4 | 8 Medium | OPEN |
| R16 | A10 / notifications and billing metadata | C | 2 | 4 | 8 Medium | OPEN |

## Risk records

### R01 — A01–A03 / staff login

- Threat: Stolen staff password enables unauthorized clinical access.
- Vulnerability / uncertainty: MFA is versioned but activation, migration, factor key and enrollment are not evidenced.
- Impact dimension: C/I. Likelihood 3, impact 5, score 15; rationale: Staff credential theft is plausible; privileged access can expose or alter many records.
- Control state: VERSIONED — NOT DEPLOYED (E01–E05).
- Mitigation: Activate only through authorized key/migration/FE-before-BE sequence; verify pending isolation, recovery and all staff enforcement.
- Proposed accountable / delivery owner: Security Officer / BE and FE leads. Named assignment OPEN.
- Evidence / closure requirement: E01–E05; require deployed image/config IDs, migration receipt, redacted enrollment coverage and authenticated E2E report. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 15 High, provisional; no verified production reduction. Target residual: 2×5=10 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R01; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R02 — A02–A04 / record and tenant access

- Threat: Patient, staff or insider reads or modifies another tenant/patient record.
- Vulnerability / uncertainty: Role and tenant controls observed in source; exhaustive object-level checks and revocation behavior unverified.
- Impact dimension: C/I. Likelihood 3, impact 5, score 15; rationale: Cross-tenant identifiers are a credible attack surface with broad disclosure impact.
- Control state: VERSIONED — DEPLOYMENT OPEN (session auth source).
- Mitigation: Certify object-level authorization for read/write/export, patient ownership, tenant separation, role changes and disabled users.
- Proposed accountable / delivery owner: BE lead / Security Officer. Named assignment OPEN.
- Evidence / closure requirement: Require deployed role matrix, negative cross-tenant tests, access review and revocation results. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 15 High, provisional; no verified production reduction. Target residual: 2×5=10 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R02; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R03 — A05 / AI inputs, outputs and derived stores

- Threat: Clinical content is disclosed, retained or reused outside authorized purpose.
- Vulnerability / uncertainty: Provider, payload boundary, retention/training terms, BAA applicability and derived-data deletion unknown.
- Impact dimension: C/I. Likelihood 3, impact 5, score 15; rationale: Clinical prompts may contain identifiable records; external retention can broaden exposure.
- Control state: OPEN; no verified vendor or operational safeguard.
- Mitigation: Map prompts/context/output and embeddings if any; establish minimum-necessary inputs, authorized use, contracts, retention and human review; propose holding unapproved ePHI flows pending approval.
- Proposed accountable / delivery owner: Privacy/legal lead / AI lead. Named assignment OPEN.
- Evidence / closure requirement: Require synthetic payload trace, exact model/service account, signed applicable agreements, configured retention/training evidence and output-review tests. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 15 High, provisional; no verified production reduction. Target residual: 2×5=10 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R03; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R04 — A03–A07 / security and clinical audit

- Threat: Unauthorized record activity is undetected or cannot be reconstructed.
- Vulnerability / uncertainty: Audit code exists; completeness, integrity, time sync, retention, restricted access and alert review unverified.
- Impact dimension: C/I. Likelihood 3, impact 4, score 12; rationale: Missed or editable events can prevent timely detection and attribution.
- Control state: VERSIONED — DEPLOYMENT OPEN (E02 and session audit observations).
- Mitigation: Verify actor/tenant/action/resource/outcome/time for access, changes, export, MFA/reset and failures; protect and routinely review trails without raw clinical payloads.
- Proposed accountable / delivery owner: Security Officer / observability lead. Named assignment OPEN.
- Evidence / closure requirement: Require redacted event samples, coverage tests, retention/access configuration, integrity protection and alert investigation evidence. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 12 High, provisional; no verified production reduction. Target residual: 2×4=8 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R04; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R05 — A04, A08 / stored ePHI

- Threat: Stolen storage, snapshot or privileged copy exposes records.
- Vulnerability / uncertainty: DB, document, replica and backup encryption and key separation not verified; factor encryption is not DB encryption.
- Impact dimension: C. Likelihood 3, impact 5, score 15; rationale: Multiple storage copies may expose large datasets if obtained.
- Control state: OPEN; MFA factor crypto code does not close this risk.
- Mitigation: Inventory all storage; verify encryption scope, algorithms/configuration, key custody/access, backup encryption and rotation/recovery procedures.
- Proposed accountable / delivery owner: Platform lead / Security Officer. Named assignment OPEN.
- Evidence / closure requirement: Require account/resource-specific storage attestations/config exports and KMS/access/rotation evidence; no keys in artifacts. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 15 High, provisional; no verified production reduction. Target residual: 2×5=10 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R05; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R06 — A04, A08 / backup and restoration

- Threat: Ransomware, deletion or outage causes unrecoverable records or prolonged care disruption.
- Vulnerability / uncertainty: Backup coverage, isolation, restore integrity, RPO/RTO and availability of decryption keys unknown.
- Impact dimension: I/A. Likelihood 3, impact 5, score 15; rationale: Loss or corruption of clinical storage can interrupt care and recovery.
- Control state: OPEN; no backup, PITR, encryption or restore capability verified. [BR-01](hipaa-backup-restore-control.md) is draft documentation only, not an implemented control.
- Mitigation: Approve clinical RPO/RTO; verify isolated/immutable recovery copies as appropriate; restore DB/files and dependencies in isolation; test reconciliation and emergency operations.
- Proposed accountable / delivery owner: Platform lead / clinical owner. Named assignment OPEN.
- Evidence / closure requirement: BR-E01–BR-E10 in [BR-01](hipaa-backup-restore-control.md), all OPEN; separately authorized drill required. Require backup success history, retention/access config, timestamped restore exercise, measured RPO/RTO, integrity checks and key-recovery test. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 15 High, provisional; no verified production reduction. Target residual: 2×5=10 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R06; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R07 — A01–A10 / incident handling

- Threat: Delayed containment or notification increases harm from unauthorized disclosure.
- Vulnerability / uncertainty: Named response team, escalation, evidence preservation and breach-assessment procedure not supplied.
- Impact dimension: C/I/A. Likelihood 3, impact 4, score 12; rationale: A plausible event can expand without a rehearsed response.
- Control state: OPEN; response documentation/evidence missing from assessment.
- Mitigation: Approve incident playbook and on-call contacts; rehearse containment, continuity, forensics and Privacy/legal breach determination with applicable notifications.
- Proposed accountable / delivery owner: Security Officer / Privacy lead. Named assignment OPEN.
- Evidence / closure requirement: Require approved playbook, vendor escalation terms, tabletop record, timed decisions and notification applicability review. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 12 High, provisional; no verified production reduction. Target residual: 2×4=8 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R07; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R08 — A02, A04–A10 / vendors and subprocessors

- Threat: Vendor or subprocessor handles ePHI without appropriate assurance or authorized terms.
- Vulnerability / uncertainty: Complete vendor inventory, legal-role decisions, executed BAAs, service eligibility and subcontractor coverage not supplied for this assessment; their actual existence is OPEN.
- Impact dimension: C/I/A. Likelihood 3, impact 5, score 15; rationale: Cloud/support/AI paths can expose records beyond direct control.
- Control state: OPEN; no BAA verified.
- Mitigation: Complete vendor ledger below; verify exact legal entities, service/account coverage and required agreements before approving corresponding ePHI flow.
- Proposed accountable / delivery owner: Privacy/legal lead / procurement. Named assignment OPEN.
- Evidence / closure requirement: Require executed applicable BAA or reviewed non-BA rationale, DPA/security terms, subprocessor list, retention/deletion and incident terms. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 15 High, provisional; no verified production reduction. Target residual: 2×5=10 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R08; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R09 — A07 / telemetry and support exports

- Threat: Logs, analytics, replay or support artifacts leak ePHI or MFA secrets.
- Vulnerability / uncertainty: Redaction is source-evidenced; all sinks, payloads, URLs, DOM capture and operational configuration unverified.
- Impact dimension: C. Likelihood 3, impact 4, score 12; rationale: Routine error reporting may propagate sensitive fields to external systems.
- Control state: VERSIONED — DEPLOYMENT OPEN; MFA-sensitive field-name redaction changes VERSIONED — NOT DEPLOYED (E03–E05).
- Mitigation: Inventory sinks; validate synthetic PHI/secret redaction at every boundary, URL and error path; verify replay/capture and retention/access settings.
- Proposed accountable / delivery owner: Security Officer / FE and BE leads / observability lead. Named assignment OPEN.
- Evidence / closure requirement: Require sink-specific synthetic canary tests, redacted payload captures, configuration and retention/access records. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 12 High, provisional; no verified production reduction. Target residual: 2×4=8 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R09; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R10 — A01, A09 / endpoints and workforce

- Threat: Lost device, malware or unattended session exposes clinical data.
- Vulnerability / uncertainty: Device encryption, screen lock, local downloads, training, remote wipe and physical access evidence unavailable.
- Impact dimension: C/I. Likelihood 3, impact 4, score 12; rationale: Workforce devices display and may download patient data.
- Control state: OPEN; no endpoint safeguard verified.
- Mitigation: Define authorized-device and remote-access policy; verify encryption, lock, patching, malware controls, least privilege, physical safeguards and training.
- Proposed accountable / delivery owner: IT lead / Security Officer. Named assignment OPEN.
- Evidence / closure requirement: Require device inventory, redacted management-policy evidence, training roster and lost-device exercise. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 12 High, provisional; no verified production reduction. Target residual: 2×4=8 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R10; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R11 — A01–A06, A10 / transmission and realtime

- Threat: Interception or misrouted media/API traffic exposes or alters care data.
- Vulnerability / uncertainty: HTTPS references do not prove TLS on every hop; signaling, relay/media and certificate configuration unknown.
- Impact dimension: C/I. Likelihood 3, impact 4, score 12; rationale: API, media and integration boundaries create plausible interception paths.
- Control state: OPEN; no operational encryption attestation.
- Mitigation: Inventory each hop; verify TLS/certificate handling and media transport protection, relay access, destination restrictions and any recording path.
- Proposed accountable / delivery owner: Platform lead / realtime lead. Named assignment OPEN.
- Evidence / closure requirement: Require endpoint inventory, negotiated-protocol evidence and negative certificate tests in a safe environment; verify actual media protection without claiming end-to-end encryption. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 12 High, provisional; no verified production reduction. Target residual: 2×4=8 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R11; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R12 — A03, A04, A09 / keys, privileged access and delivery

- Threat: Compromised operator/CI identity or lost keys permits ePHI access or prevents recovery.
- Vulnerability / uncertainty: Production access, secret inventory, MFA key lifecycle, privileged MFA and emergency access not evidenced.
- Impact dimension: C/I/A. Likelihood 3, impact 5, score 15; rationale: Administrative access can affect the entire service and encrypted factors.
- Control state: OPEN; factor key requirement source-evidenced (E02).
- Mitigation: Inventory secrets and privileged identities; validate least privilege, access removal, protected delivery, rotation, durable MFA key recovery and audited emergency access.
- Proposed accountable / delivery owner: Platform lead / Security Officer. Named assignment OPEN.
- Evidence / closure requirement: Require redacted privilege review, secret-store configuration, joiner/mover/leaver and key-recovery tests; never export raw secrets. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 15 High, provisional; no verified production reduction. Target residual: 2×5=10 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R12; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R13 — A01–A10 / ePHI retention and copies

- Threat: Untracked copies survive deletion or exceed authorized retention.
- Vulnerability / uncertainty: Data inventory, retention/disposal schedule, test/support exports and vendor-copy coverage incomplete.
- Impact dimension: C. Likelihood 3, impact 4, score 12; rationale: Repeated copies and undefined retention enlarge potential disclosure.
- Control state: OPEN; inventory/evidence missing.
- Mitigation: Validate full ePHI inventory and legally approved retention; cover caches, exports, derived AI data, backups and device disposal; use synthetic nonproduction data.
- Proposed accountable / delivery owner: Privacy lead / data owners. Named assignment OPEN.
- Evidence / closure requirement: Require approved inventory, retention matrix, deletion/disposal test and documented backup/legal-hold exceptions. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 12 High, provisional; no verified production reduction. Target residual: 2×4=8 Medium, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R13; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R14 — A03–A05 / clinical record integrity

- Threat: Accidental edit, AI suggestion or integration overwrite corrupts a record.
- Vulnerability / uncertainty: Production integrity, provenance, concurrency and clinical approval evidence not assessed.
- Impact dimension: I. Likelihood 2, impact 4, score 8; rationale: Errors are credible, but no incident or defect is established.
- Control state: OPEN; certified contracts remain frozen.
- Mitigation: Validate existing approval/signature, provenance and concurrent-update controls with synthetic cases; confirm AI output requires appropriate clinician review.
- Proposed accountable / delivery owner: Clinical owner / BE lead. Named assignment OPEN.
- Evidence / closure requirement: Require contract-preserving integrity/concurrency tests, provenance samples and clinical sign-off. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 8 Medium, provisional; no verified production reduction. Target residual: 1×4=4 Low, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R14; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R15 — A03–A06 / runtime dependencies and availability

- Threat: Vulnerable dependency or exhaustion interrupts or compromises ePHI services.
- Vulnerability / uncertainty: Production dependency applicability, patch SLA, capacity and security testing evidence incomplete.
- Impact dimension: C/I/A. Likelihood 2, impact 4, score 8; rationale: Repository alerts are not proof of deployed exploitability; assess actual exposure.
- Control state: OPEN; previous push reported dependency alerts, not triaged here.
- Mitigation: Map runtime versions and advisories; prioritize reachable risks; verify capacity/failure handling and bounded security testing under change control.
- Proposed accountable / delivery owner: Engineering lead / Security Officer. Named assignment OPEN.
- Evidence / closure requirement: Require SBOM, triage of actual deployed dependencies, remediation exceptions and availability/security test results. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 8 Medium, provisional; no verified production reduction. Target residual: 1×4=4 Low, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R15; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

### R16 — A10 / notifications and billing metadata

- Threat: Misaddressed notification or excessive vendor metadata reveals care relationship.
- Vulnerability / uncertainty: Recipient validation, minimum-necessary fields and actual processors not verified.
- Impact dimension: C. Likelihood 2, impact 4, score 8; rationale: Misdirected metadata can identify patients even without clinical notes.
- Control state: OPEN; production flows unverified.
- Mitigation: Trace synthetic booking/notification/payment metadata; verify recipient identity, payload minimization and service/BAA decisions with Privacy lead.
- Proposed accountable / delivery owner: Product lead / Privacy lead. Named assignment OPEN.
- Evidence / closure requirement: Require recipient-negative tests, redacted payload map and vendor decision linked to R08. Artifact location, collector, date and reviewer OPEN unless E01–E06 explicitly provides limited session evidence.
- Current residual: 8 Medium, provisional; no verified production reduction. Target residual: 1×4=4 Low, subject to witnessed effectiveness and acceptance.
- Status: OPEN. Work item R16; due gate and timing in the management plan. Last assessed 2026-09-07; next review and acceptance date OPEN.

## Vendor and BAA evidence ledger — R08 and dependent risks

Names identify session references or candidate service categories, not a confirmed deployment inventory. No executed BAA, eligible plan or encryption attestation was supplied for any entry. An applicable BAA must match the contracting legal entity and exact product/service, account, subprocessor scope and effective dates. A “not applicable” decision requires Privacy/legal sign-off and evidence of the data boundary; do not infer it from vendor branding.

| Vendor / category | Potential ePHI or privileged pathway | Evidence basis | Required decision / artifact | Status |
|---|---|---|---|---|
| Vercel / FE hosting and Analytics | Requests, SSR, operational logs, URLs and analytics | Hosting/analytics references observed in session | Confirm actual services/account, payloads, support access, eligible terms, BAA applicability and executed coverage if required | OPEN |
| BE hosting, DB/storage, backup and secret providers — names OPEN | Clinical storage, compute, copies, encryption keys and administration | Architecture requires BE/storage; actual vendor not verified | Identify legal entities, regions, products, shared responsibility, subprocessors, encryption/restore evidence and applicable agreements | OPEN |
| AI/model, retrieval and embedding providers — names OPEN | Prompts/context, outputs, derived data and provider logs | AI functionality known, provider not verified | Exact endpoint/model/account; retention/training configuration, authorized use, deletion and applicable BAA coverage | OPEN |
| Sentry / error monitoring | Exceptions, breadcrumbs, identifiers or request data | FE dependency/config source observed | Enabled account/service and payload review; retention, support access and applicable BAA decision | OPEN |
| TURN/media, recording or transcription providers — names OPEN | Media, chat, connection metadata; recordings only if enabled | WebRTC/chat context; external processors unknown | Map actual relays/recording/transcripts, transport, retention and BAA determination | OPEN |
| Notification/email/SMS providers — names OPEN | Patient contact and appointment/clinical metadata | Candidate clinical communication flows | Confirm actual service, payload minimization, recipient controls and applicable agreements | OPEN |
| Payku / Stripe — production use OPEN | Booking/billing metadata may disclose care relationship | References/dependencies seen; unrelated Stripe work excluded from MFA commit | Distinguish actual services and financial-processing role from health-data processing; do not assume either BAA obligation or exemption | OPEN |
| GitHub, CI, support/ticketing and developer tools | Privileged deployment path; ePHI only if logs, fixtures or attachments contain it | Repos verified; ePHI presence not verified | Prove no-ePHI boundary or include actual processing/agreements; review privileged access either way | OPEN |

For each actual processor add: vendor owner, contract owner, service/account ID (non-secret), ePHI categories, purpose, destination/region, subprocessors, signed-document reference, security assessment date, incident contact, retention/deletion terms and next review. Vendor removal from scope requires recorded evidence, not a blank row.

## Backup/PITR evidence follow-up — 2026-09-08

See [read-only infrastructure and source evidence](hipaa-backup-restore-evidence.md), BR-O01–BR-O09. Production service-to-DB configuration and volume metadata are partially verified; backup/PITR, encryption, retention/access and target readiness remain OPEN. Versioned backup/restore scripts have documented drill blockers. R06 remains 15 High, target 10 Medium; no operational risk is closed. This follow-up continues BR-01 and does not authorize execution. Earlier MFA non-deployment statements describe the original checkpoint: later user-reported accidental deployment supersedes that historical assumption; current runtime and successful activation remain unverified here.
