# HeyDoctor — Backup, PITR and Restore Control

Version 0.2 | Updated 2026-09-08 | DRAFT — review required | Control BR-01

Risk owner: proposed Platform lead; named owner and acceptance OPEN. Security Officer, clinical owner and Privacy/legal approval OPEN. Related: [risk analysis](hipaa-risk-analysis.md), [management plan](hipaa-risk-management-plan.md), [R06 and related risks](hipaa-risk-register.md).

## 1. Decision and verified baseline

**No operational backup, point-in-time recovery (PITR), encryption, immutability or restore capability has been verified. All remain OPEN. No restore has been performed.** This procedure proposes control requirements; it is not an executable provider runbook or approval to transfer ePHI. No code, environment, deployment, Production mutation, new infrastructure or architecture redesign is authorized. MFA activation was not authorized in the original baseline; later accidental-deployment reports and current-runtime uncertainty are recorded in the evidence follow-up.

Original checkpoint evidence was limited to the documentation foundation committed as 5a679bba9bb6b66bbcf374adee39f6f765a828dc and the source/test evidence E01–E05 listed in the analysis. Those records establish a relational-data-dependent application and versioned code, not a recoverable Production database. BR-O01–BR-O06 now identify the configured Production DB service/image and volume. Live engine, region, complete storage inventory, backup configuration and restore permissions remain OPEN. Do not infer them from repository names, an available connector or vendor marketing.

## 2. ePHI backup scope and dependency manifest

The Platform lead must reconcile this provisional scope with the actual asset inventory before approving a drill. Each item needs a non-secret resource ID, owner, environment/region, data categories, backup method, consistency boundary, retention, recovery dependency and evidence reference. No data store or recording is asserted to exist merely because it appears below.

| Scope | What must be recoverable if maintained | Recovery dependency / current evidence |
|---|---|---|
| A03/A04 clinical relational data | Patients, tenant/clinic relationships, clinical records, appointments, consents, provenance, signatures and relevant billing linkage | Source architecture known; actual datasets, constraints, coverage and backup artifacts OPEN |
| A04 documents and files | Uploaded/generated clinical documents and their DB references; object versions if used | Actual file/object storage and consistent DB/file recovery point OPEN |
| A07 audit | Required clinical/security access and mutation trails, with integrity and actor/time attribution | Audit source evidence only; store, backup/retention and integrity OPEN |
| A05 AI-derived records | Retained clinical AI inputs/outputs, provenance or retrieval data that cannot safely be regenerated, if present | Actual stores and approved retention OPEN; do not replicate unauthorized provider data or create new retention merely for this policy |
| A06/A10 communication/integration records | Persisted clinical messages, care-related notification state, recordings/transcripts only if actually retained | Inventory OPEN; transient media is not automatically a backup requirement |
| A03/A09 identity and security state | User/role/tenant bindings, revocation state and applicable factor records | MFA factor source exists; actual deployed/schema/key state requires re-attestation; do not introduce future schema into an older restored release. Restoring stale session/recovery state is a security hazard |
| A08/A09 recovery dependencies | Schema/migration ledger, exact deployed artifacts/configuration references, key versions and access needed to decrypt retained data | Repository SHAs are not deployed-version proof. Secure key recovery and release manifest OPEN; never store plaintext secrets with data exports or in Git |
| A01 endpoint-held originals | Authorized clinical files or exports with no authoritative recoverable server copy | Existence OPEN; identify and govern recovery or approved disposal rather than silently excluding them |

Include replicas, regional copies, vendor exports and disaster-recovery destinations in the inventory. A replica is not evidence of an independently recoverable backup. An undocumented cache is not a recovery source. A deletion, legal hold or retention obligation must be considered for every copy. Exclude disposable caches only after proving reconstruction from protected authoritative data and documenting clinical/privacy approval.

Recovery must use a manifest connecting DB checkpoint/time, file/object versions, audit coverage and encryption-key references. Recovering each store successfully in isolation does not establish a coherent clinical record. Cross-store consistency and potential gaps remain OPEN until tested.

## 3. Proposed recovery objectives — not current capabilities

These are internal planning targets, not HIPAA-prescribed numbers or service commitments. Clinical owner and Security Officer must approve the impact analysis, staffing, cost and objectives before operational adoption; actual achievable values remain OPEN. T0 and due gates follow the management plan.

| Data/service tier | Proposed RPO | Proposed RTO | Acceptance basis |
|---|---|---|---|
| Core clinical DB, required documents and identity dependencies | At most 15 minutes | At most 4 hours | Consistent recovered data and usable authorized clinical workflow, not merely a database process starting |
| Audit evidence needed to reconstruct access and recovery | At most 15 minutes | At most 4 hours | Required events queryable and gaps explained; recovery itself has an attributable audit trail |
| Approved noncritical derived data | At most 24 hours | At most 24 hours | Only after clinical/privacy approval establishes no effect on essential care, legal evidence or core workflow; otherwise use the core tier |

RPO measurement: record incident/reference cutoff T_event and the latest **validated consistent** recoverable committed state T_recovered; data-loss interval = T_event minus T_recovered, including uncovered files/audit dependencies. Backup job start time is not T_recovered. For corruption, choose a known-good recovery point before corruption, identify lost valid work and report its actual loss even if it exceeds target.

RTO measurement: elapsed time from actual service disruption to clinical-owner validation of safe service restoration. A drill uses a declared simulated disruption start and a witnessed safe-recovery endpoint; include access approval, provisioning, transfer, replay, decryption, validation and decision time. Separately label real cutover duration as NOT TESTED if no cutover occurs. A drill in which the clock starts only after a backup is restored cannot claim the target was met.

The full scenario is successful only when all core dependencies meet approved objectives. If available backup/PITR cannot support 15 minutes, record the measured limitation, propose authorized remediation or an explicitly revised clinically approved target, and keep R06 OPEN until the revised basis and effectiveness are verified. Do not silently relax the target after a failed drill.

## 4. Backup and PITR responsibility matrix

All assignments are proposed roles; named people, backup delegates and on-call contacts OPEN. Provider-managed service does not transfer HeyDoctor's verification responsibility.

| Role | Responsibility | Evidence needed |
|---|---|---|
| Platform lead — accountable | Inventory actual stores; establish supported backup/PITR method; verify schedule, failures, retention, permissions, recoverable window and runbook; operate an authorized drill | Resource-specific configuration and recent success/failure history, actual earliest/latest recoverable points, tested steps |
| Actual DB/storage provider — identity OPEN | Deliver only capabilities and support responsibilities in the verified service agreement; document physical durability and customer/provider boundaries | Exact account/product/plan/version, official documentation, contractual scope and support escalation; no assumed PITR |
| Security Officer | Approve access, isolated recovery protections, evidence handling, key custody and incident containment; review restore security state | Access review, control evidence and security sign-off |
| Clinical owner | Approve downtime/data-loss tolerances, critical data, continuity workflow, integrity validation and return-to-service decision | Impact analysis, RPO/RTO approval, witnessed clinical checks |
| Privacy/legal | Approve backup destination/processor, applicable BAA, retention/legal hold and temporary ePHI copy handling | Executed applicable agreements or documented determination, retention and deletion authorization |
| BE/data custodian | Verify schema/artifact compatibility, cross-store references, tenant boundaries and integration/session reconciliation | Recovery manifest, validation queries/test specification and results |
| Independent reviewer / executive sponsor | Review evidence and accept residual disposition under the existing plan | Dated review, exceptions, residual rating, expiry and accountable approval |

PITR means reconstructing a selected point using a supported base backup and a complete change-log chain or a verified managed-service equivalent. No such mechanism is currently evidenced. Where applicable, inspect base-backup coverage, log continuity, replay limits and retention/earliest restore point. A periodic logical export or snapshot must not be labeled PITR. Use the actual verified provider procedure only after the service is identified; exact commands, source/target IDs and operator permissions remain OPEN.

## 5. Restore-drill procedure — future authorization required

### Gate A: authorize and prepare

1. Name the accountable operator, reviewer and clinical validator; specify purpose, incident/reference time, approved targets, source resource, target resource and permitted data. Obtain separate written drill authorization. A full production recovery is a different authorization.
2. Verify the exact deployed BE/FE artifacts and DB schema/migration history associated with the chosen backup. Use that compatible baseline; do not deploy the versioned MFA or HIPAA work as part of recovery.
3. Identify an actual backup/recovery point and key references from verifiable evidence; check completeness, readability, retention window and integrity. For PITR, verify the full required recovery chain and selectable timestamps. If any dependency is unknown or missing, stop before attempting restore.
4. Select an already-approved isolated target and verify resource IDs twice with a second reviewer. Actual target and capacity are OPEN. Never restore over Production, repoint Production, change DNS or connect production workers. If isolation is unavailable, request a separate authorized setup; this document does not create it.
5. Verify access, encryption, destination/BAA applicability and evidence restrictions for the copy. Prevent outbound patient messages, payments, booking/holds, AI calls and external webhooks; prevent background jobs/outbox replay and session-bearing connections to Production. Verify containment before starting any restored application. Do not send real ePHI into an unapproved test environment. Synthetic-only rehearsal is useful but does not prove Production backups recover.

### Gate B: recover in isolation

6. Record the simulated disruption clock, operator actions and immutable backup/manifest references. Perform only the separately approved provider-specific restore to the isolated target. For PITR, select the authorized known-good point and record actual replay completion; if PITR is unavailable, explicitly label the snapshot/export method and measured gap.
7. Recover required files, audit and supporting state to the compatible consistency point. Retrieve needed decryption access through approved secret-management procedures; record key-version references only. Do not copy secret values into commands captured as evidence, screenshots or the repository. Verify restored content is readable without claiming this proves all storage encryption.
8. Validate schema/version, constraints, record counts and cross-store references against an approved expected manifest. Use synthetic canaries where permitted, redacted aggregate checks and restricted clinical-owner review for actual ePHI; record completeness and corruption gaps. Check tenant boundaries and clinical provenance/signatures using existing certified contracts.
9. Assess restored security and integration state before any application validation. Historical copies may resurrect revoked refresh/session tokens, removed privileges, deleted records, consumed MFA backup codes or obsolete replay counters. Compare to authoritative post-backup events where available; require a reviewed reconciliation and invalidation plan before any real return to service. Do not reuse expired booking holds, replay payments or dispatch stored messages. If authoritative state is unavailable, retain isolation and escalate. A pre-MFA backup is not a rollback path around later MFA enforcement.
10. Validate the existing clinical workflow with designated authorized test identities in the isolated environment. Witness measured RPO and RTO; mark any untested return-to-service step explicitly. Capture errors as well as successful results. A green startup, test login or provider dashboard alone is insufficient.

### Gate C: close the drill, not the incident

11. Keep Production unchanged. Record PASS, FAIL or INCOMPLETE for every criterion. Do not convert INCOMPLETE/OPEN to PASS. Obtain operator, Security Officer and clinical-owner review. R06 remains OPEN until required evidence and residual disposition are approved.
12. Revoke temporary access and dispose of the isolated data/copies under approved retention and legal-hold rules; preserve redacted evidence. Record deletion completion or an approved, access-controlled hold with expiry. If cleanup fails, open/escalate an exposure issue.

Actual incident recovery would additionally require a separately approved write-fencing, reconciliation, final validation, cutover and fallback plan for the current architecture, plus clinical continuity and privacy decisions. Those provider-specific steps are OPEN, not implicitly certified by an isolated drill. On drill failure, preserve the original backup and sanitized failure evidence; do not overwrite, delete or “repair” the source or fall back to an unprotected release.

## 6. Required evidence package

All artifacts are OPEN. Keep actual backup data, ePHI, secrets and credentials outside Git in a restricted evidence location. Each reference must include collector/date, environment/resource, deployed version, method, expected/actual result, reviewer and revalidation trigger.

| ID | Required artifact | Status |
|---|---|---|
| BR-E01 | Complete scoped resource/dependency manifest, data owner, actual provider/account/region and deployed/schema baseline | OPEN |
| BR-E02 | Approved RPO/RTO, clinical impact/continuity decision, named operators and authorized drill ticket | OPEN |
| BR-E03 | Resource-specific backup settings, schedule, retention, failure history, actual backup identifiers and integrity records | OPEN |
| BR-E04 | PITR support/enabled-state evidence, earliest/latest recoverable points and chain continuity; or verified unavailability plus approved alternative treatment | OPEN |
| BR-E05 | Actual storage/transfer encryption, key-version custody/recovery, least privilege, vendor agreements and destination approval | OPEN |
| BR-E06 | Isolated source/target verification, network/job/side-effect containment and reviewer sign-off | OPEN |
| BR-E07 | Timestamped restore/replay transcript, readable data, record/reference/provenance checks, source/target comparison and gaps | OPEN |
| BR-E08 | Measured RPO/RTO calculations, clock boundaries, expected vs actual clinical checks, explicit untested cutover/limitations | OPEN |
| BR-E09 | Session/privilege/hold/payment/message reconciliation assessment and proposed safe return-to-service controls | OPEN |
| BR-E10 | Failure/escalation record, cleanup/access-revocation evidence, independent review and R06 residual-risk disposition | OPEN |

## 7. Failure, escalation and monitoring criteria

Proposed operational thresholds require approval and on-call implementation; no monitoring is asserted to exist. Detect backup failures when they occur rather than relying on the monthly governance review in the parent plan.

- Abort the drill immediately for wrong/uncertain target identity, unapproved ePHI destination, missing keys, corrupt/incomplete backup chain, failed isolation, external side effects, integrity failure or unauthorized access. Notify Platform and Security immediately; Privacy/legal joins any suspected disclosure and clinical owner any care-impacting loss.
- Treat a core recoverability gap over 15 minutes, a failed/missing scheduled backup, broken PITR continuity, loss of all verified recovery points or inability to recover before retention expiry as an urgent operational failure under these proposed targets. Escalate to Platform/on-call immediately, and Security/clinical owner if recoverability is impaired or unknown. A restored job indicator alone does not clear the failure.
- Proposed incident-response acknowledgment target: 15 minutes from alert; if not acknowledged, escalate to the backup on-call and Security Officer. At two hours without a credible recovery path, escalate the four-hour RTO risk to the clinical owner and sponsor. At four hours, record the breach of the approved target and invoke the approved continuity process; do not wait for that deadline to escalate likely failure. Contacts and coverage OPEN.
- A target miss, missing evidence, unavailable file/audit dependency, unexplained lost records or incomplete security reconciliation makes the drill FAIL or INCOMPLETE and leaves R06 OPEN. Record remediation, owner and authorized re-test date. Clinical/Privacy reviewers determine any incident reporting obligations.
- Propose quarterly witnessed restores and revalidation after backup/provider/schema/key/retention changes or incidents. Propose per-job failure alerts, daily review of recovery-point freshness and regular access/retention review. Schedules are proposed controls, not verified practice.

## 8. Retention, access and disposal requirements

Proposed initial planning baseline: 35 days of rolling recoverable backup history, with a proposed PITR window of at least 7 days **if the actual service supports and enables it**. Both are OPEN pending business/clinical/legal approval and capability evidence. Do not configure them under this task. A 35-day backup policy is not clinical-record retention; long-term authoritative record retention and legal holds must be separately approved. Do not introduce indefinite monthly archives without a justified policy. Verify expiry does not break a retained restore chain and keys remain recoverable for the full authorized backup life.

Use named least-privilege operators, strong authentication for privileged access, separation of routine backup access from deletion/key administration where supported, and recorded approval for restores and bulk exports. Proposed deletion-resistant/isolated copies and independent credential boundaries require verification; do not call replicas immutable or air-gapped. Inventory supplier/support access and review permissions quarterly and after staff changes. Actual mechanisms remain OPEN.

Backup copies and drills require approved at-rest and in-transit protection, key custody and restricted storage. Treat encryption as a verification gate, not an observed fact. Evidence must identify the actual resource and key/service boundaries without exposing secrets. A vendor BAA or encryption statement alone does not prove configuration or restore effectiveness.

Propose drill-copy deletion within 24 hours after validated evidence collection/review unless Privacy/legal approves a documented hold or shorter limit. Temporary retention, disposal owner, legal holds and deletion proof are OPEN. Restrict retained evidence and follow the parent analysis's required-documentation schedule; six-year Security Rule documentation retention does not mean every database backup or patient record must be kept for six years. [HHS Security Rule summary](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html).

## 9. Risk disposition and review

Primary risk R06 remains **OPEN: likelihood 3 × impact 5 = 15 High**. Conditional target remains **2 × 5 = 10 Medium**, requiring witnessed control effectiveness and approved residual disposition. This draft and its targets confer no reduction. Dependencies: R05 encryption, R12 keys/privilege, R13 retention; related R01 MFA security state, R04 audit, R07 incident response, R08 vendor assurance and R14 integrity. No risk counts change: 0 Critical / 13 High / 3 Medium, all 16 OPEN.

READY REVIEW: YES for documentation. READY RESTORE: NO until explicit authorization, named owners, target readiness, complete evidence prerequisites and provider-specific procedure are approved. No restore, backup configuration or Production action was executed.

## Backup/PITR evidence follow-up — 2026-09-08

See [read-only infrastructure and source evidence](hipaa-backup-restore-evidence.md), BR-O01–BR-O09. Production service-to-DB configuration and volume metadata are partially verified; backup/PITR, encryption, retention/access and target readiness remain OPEN. Versioned backup/restore scripts have documented drill blockers. R06 remains 15 High, target 10 Medium; no operational risk is closed. This follow-up continues BR-01 and does not authorize execution. Earlier MFA non-deployment statements describe the original checkpoint: later user-reported accidental deployment supersedes that historical assumption; current runtime and successful activation remain unverified here.
