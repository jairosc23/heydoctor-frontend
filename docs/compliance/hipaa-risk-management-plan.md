# HeyDoctor — HIPAA Risk Management Plan

Version 0.4 | 2026-09-07 | DRAFT — proposed actions only

Related documents: [analysis](hipaa-risk-analysis.md), [register](hipaa-risk-register.md). No action below authorizes a deployment, migration, environment change, production test, vendor data transfer or architecture redesign. These require separate authorization. This task creates documentation only. No HIPAA compliance, BAA, encryption or operational evidence is asserted.

## 1. Governance and accountability

Proposed accountable executive: HeyDoctor executive sponsor, named appointment OPEN. Proposed accountable Security Officer owns this plan; Privacy/legal determines entity role, permissible use/disclosure, agreements and breach obligations. Clinical owner approves patient-care impact and downtime tolerances. Engineering/platform custodians deliver mitigations; an independent reviewer validates evidence where practical. Names, acceptance, capacity and budget are OPEN.

T0 means formal adoption of this plan by the accountable owner; T0 is not yet set. Deadlines below are proposed maximum elapsed calendar days from T0, not permission to run an unresolved ePHI flow until then. Applicable legal/contractual obligations and an earlier activation gate take precedence. At T0+2 days assign named owners, evidence custodians and dated tickets for every risk. Escalate unassigned or overdue High risks to the sponsor within one business day. A newly discovered Critical risk requires immediate triage and an authorized containment decision.

## 2. Prioritized treatment and evidence gates

All entries remain OPEN. Register IDs are stable work-item IDs until linked to the approved tracker. “Before approval” is a decision gate, not evidence that current production is safe. For an existing uncertain ePHI flow, the owner must promptly assess exposure and recommend authorized containment; do not silently classify it as safe or shut it down without authorization.

| Work items | Proposed delivery target | Required gate / outcome | Accountable role |
|---|---|---|---|
| R01 staff MFA | T0+7 days | Before staff MFA activation is declared complete: approved release plan, verified key/migration/deployment, staff coverage and authenticated certification | Security Officer |
| R02 access isolation | T0+7 days | Before approving affected record access: tested object/tenant/patient authorization and timely revocation | BE lead |
| R03, R08 AI and vendors | T0+7 days inventory/decisions; unresolved contracts block approval | Before approving each external ePHI flow: lawful purpose, actual service/account, applicable executed agreements and operational settings verified | Privacy/legal lead |
| R04, R09 audit and telemetry | T0+14 days | Before operational assurance sign-off: redacted coverage tests, protected trails, alert ownership and safe external payloads | Security Officer |
| R05, R11, R12 encryption, transmission, keys/access | T0+14 days | Before approving affected handling: complete resource/hop coverage, verifiable protection, privileged-access review and recovery procedure | Platform lead |
| R06 backups / continuity | T0+14 days | Before recovery assurance: clinical RPO/RTO approved and isolated restore with integrity and key recovery passes | Platform lead |
| R07 response | T0+14 days | Before operational assurance sign-off: staffed playbook, escalation and tabletop with Privacy/legal notification decision process | Security Officer |
| R10 endpoints / workforce | T0+21 days | Before approving unmanaged ePHI access: device/physical safeguards and workforce authorization/training verified | IT lead |
| R13 inventory / retention | T0+14 days inventory; T0+30 days validation | Before assessment-completeness sign-off: inventory, retention/legal holds, disposal and backup exceptions approved | Privacy lead |
| R14 clinical integrity | T0+30 days | Before accepting residual risk: existing contract-preserving integrity and clinical-review tests pass | Clinical owner |
| R15 dependencies / availability | T0+7 days triage; T0+30 days treatment | Before accepting residual risk: actual deployed advisory exposure and continuity controls assessed; urgent findings override schedule | Engineering lead |
| R16 notification/billing metadata | T0+21 days | Before approving each affected transfer: recipient validation, minimal payload and vendor determination | Product lead |

## 3. MFA controlled-activation gate — R01, R05, R06, R12

This is a planning dependency, not an instruction to execute. Approved BE baseline is 47918208c126d1222309e0330c7d1363205f2dc6; FE baseline is 0c67a8f96ebe8f0c90616013506735b39bbf9736. **Original MFA checkpoint: NOT ACTIVATED; current state requires re-attestation as described in the 2026-09-08 follow-up.** Deployment state is recorded from session reports, not live attestation; source tests and a repository push are insufficient for closure.

1. Authorize a change window; validate immutable artifacts, actual enforcement configuration, compatibility and operator recovery independent of staff login. Provision MFA_TOTP_SECRET_KEY using the approved BE format and secure storage; preserve the same durable key across instances. Never place its value in this repository or evidence captures.
2. Verify DB backup and approved restoration plan; run the approved additive migration 1757800000000-CreateUserMfaFactors once only under separate authorization. Record migration/version evidence.
3. Deploy the MFA-capable FE before enforcing MFA in BE, then deploy the approved BE across all instances. Capture actual versions and enforcement behavior. No old password-only staff instance may remain an authentication path.
4. Enroll designated ADMIN and DOCTOR accounts, save backup codes securely, verify fresh logins and establish staff enrollment coverage. Do not retain QR images, seeds or recovery codes as evidence.
5. Certify against the actual BE contract using designated accounts and synthetic records. Verify: password alone yields pending state without a new session/refresh credential; pending Bearer cannot use protected APIs or refresh; confirmation alone does not issue a session; valid factors complete login; invalid/expired challenges, TOTP replay and backup-code reuse fail; role-safe redirects, revocation/logout/refresh and PATIENT regression checks pass. Record environment, versions, timestamps and redacted results.
6. Rehearse missing-key/storage-failure behavior and rollback in preproduction: staff authentication must fail closed. Do not induce key/DB failure in production for this documentation task.

Rollback decision: before BE activation, stop on failed prerequisites. After MFA enforcement, do not roll back to password-only staff login to restore availability. Use an authorized maintenance state or a validated MFA-enforcing release and prioritize forward repair. Preserve factor records and the original key; do not drop the migration after enrollment. FE-only rollback may prevent staff login. A tested continuity/recovery route must exist before activation approval.

## 4. Operational validation packages

Use synthetic ePHI wherever possible. If a production observation is necessary, obtain separate authorization and collect only restricted, redacted evidence.

- **AI/vendor package (R03/R08/R16):** trace actual payloads and derived stores; approve data categories/purpose, provider service/account, retention/training and deletion behavior; validate applicable contracts and subprocessor coverage. No identifiable patient prompts for testing until the flow is authorized.
- **Access/audit package (R02/R04/R09/R12):** negative tenant/patient/object tests; staff lifecycle and reset controls; clinical access and export events; synthetic secret/ePHI canaries through errors, logs and analytics; reviewer acknowledgment of alerts and protected retention. Do not record sensitive seed/code values.
- **Protection/recovery package (R05/R06/R10/R11):** resource-specific storage and transport coverage, device controls, isolated restore with measured data loss/recovery duration, referential/document integrity and key availability. Vendor claims or green backup jobs alone do not establish a successful restore.
- **Response/continuity package (R07/R15):** tabletop credential theft, possible data disclosure and ransomware/outage; capture detection, containment authorization, clinical continuity, evidence preservation, vendor contacts and notification decisions. Privacy/legal determines applicable recipients and deadlines; this foundation does not invent a uniform notification deadline.
- **Inventory/integrity package (R13/R14):** reconcile data locations and retention with actual exports/backups/AI stores; test existing provenance and clinical approval behavior without changing contracts.

Backup/recovery procedure for R06: [BR-01 backup and restore control](hipaa-backup-restore-control.md). Proposed core RPO ≤15 minutes and RTO ≤4 hours require clinical/security approval; no backup or PITR capability is verified. Evidence BR-E01–BR-E10 and a separately authorized isolated drill are required. R06 remains OPEN, 15 High; the existing T0+14-day gate is unchanged. This addition is draft pending review and does not change the MFA activation state.

## 5. Evidence, closure and residual acceptance

Each risk follows OPEN → IN PROGRESS → PENDING VERIFICATION → CLOSED or ACCEPTED WITH EXPIRY. IN PROGRESS and PENDING VERIFICATION remain unresolved for readiness reporting. CLOSED requires completed treatment, verified evidence and approval of the residual disposition; ACCEPTED WITH EXPIRY requires documented residual acceptance and cannot substitute for unresolved evidence or required legal obligations. Failed tests, material changes or expired evidence reopen the risk. Status transitions must retain history; none have occurred in this foundation.

Required closure record: risk ID; named accountable owner; action/ticket; completed date; exact environment and versions; restricted artifact reference/hash; collector and test method; expected/actual result; independent reviewer and review date; confirmed control state; revised likelihood, impact and rationale; residual treatment and approval; next review/expiry. An empty field or unresolved evidence means OPEN, never PASS. E01–E05 are limited session evidence and do not satisfy operational gates alone.

Targets in the register are not guarantees. They retain initial impact and propose only a likelihood reduction after control-effectiveness verification; reducing impact later requires separate scenario-specific evidence. After effectiveness is verified, Security Officer and the clinical/privacy owner propose a residual rating. The accountable sponsor signs acceptance with a business rationale, compensating safeguards, monitoring owner and explicit expiry (proposed maximum 90 days for exceptions). Required legal obligations and applicable agreements cannot be replaced by risk acceptance. Critical/High unresolved risk blocks a positive HIPAA readiness recommendation; any business continuation decision must be separately recorded and must not be called compliance approval.

## 6. Monitoring and reassessment

Proposed monthly tracking: named-owner coverage; overdue High items; percentage of staff with enforced MFA; failed/bypass test results; audit coverage and alert handling; backup failures and age of last witnessed restore; privileged-access review age; vendor agreement/evidence coverage; ePHI sink inventory completeness; open incident and reachable-vulnerability age. Values are OPEN; no dashboard or metric source has been verified.

Review the register quarterly and the complete analysis annually, and immediately after incidents, new ePHI flows/vendors, deployment/key/storage changes or failed effectiveness checks. Retain previous assessments, decisions and evidence references under the approved documentation schedule. Preserve clinical records under their separately approved retention obligations.

## 7. Adoption checklist and decision

- Named Security Officer, Privacy/legal reviewer, clinical owner and executive sponsor: OPEN.
- Complete ePHI asset/flow and vendor inventory with accountable custodians: OPEN.
- Per-risk evidence locations, dated work items, resources and approved due dates: OPEN.
- MFA activation/authenticated certification and production safeguards: OPEN.
- Applicable agreements, continuity/response exercises and residual-risk approvals: OPEN.

Decision: **documentation-only final consistency review complete; ready to version as a draft, not ready for a positive production HIPAA assurance or activation decision.** Documentation approval does not authorize operational changes.

Reference: HIPAA risk management addresses identified risks through safeguards and documented decisions; the framework and requirements must be assessed for the actual entity and systems. [HHS Security Rule summary](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html). Cloud assurance and BAA determinations must address actual ePHI handling. [HHS cloud guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html).

## Backup/PITR evidence follow-up — 2026-09-08

See [read-only infrastructure and source evidence](hipaa-backup-restore-evidence.md), BR-O01–BR-O09. Production service-to-DB configuration and volume metadata are partially verified; backup/PITR, encryption, retention/access and target readiness remain OPEN. Versioned backup/restore scripts have documented drill blockers; local uncommitted script fixes and offline tests are recorded in the evidence follow-up, with operational validation still OPEN. R06 remains 15 High, target 10 Medium; no operational risk is closed. This follow-up continues BR-01 and does not authorize execution. Earlier MFA non-deployment statements describe the original checkpoint: later user-reported accidental deployment supersedes that historical assumption; current runtime and successful activation remain unverified here.
