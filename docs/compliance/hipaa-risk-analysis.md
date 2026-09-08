# HeyDoctor — HIPAA Risk Analysis

Version: 0.2 | Assessment date: 2026-09-07 | Status: DRAFT — READY FOR HUMAN REVIEW, NOT APPROVED

Accountable reviewer: proposed Security Officer; named appointment and acceptance OPEN. Privacy/legal applicability review OPEN. This is a documentation foundation, not a completed enterprise risk analysis, operational certification, or a claim of HIPAA compliance. No production, vendor-account, environment, or database inspection was performed for this assessment. No deployment, migration, configuration change, commit or push is authorized by this document.

## 1. Purpose and assessment boundary

Assess confidentiality, integrity and availability (C/I/A) of ePHI that HeyDoctor may create, receive, maintain or transmit. The architecture remains frozen. This assessment uses the session's architecture and MFA review evidence; it neither redesigns systems nor changes certified contracts. Legal entity, covered-entity/business-associate role, customers, jurisdictional applicability, workforce and subcontractor scope require confirmation. Treat these as OPEN rather than assuming HIPAA applicability or exemption.

The assessment covers live services and supporting systems with a plausible ePHI path, including derived data, backups, endpoints and support access. Pure public marketing, source code and payment-card processing without health-identifying linkage are outside this boundary; clinical identifiers, appointment metadata, production extracts, diagnostic logs or support attachments bring those systems into scope. No exclusion is final without a documented flow review. Credentials and MFA secrets are security-critical supporting assets even when not themselves ePHI.

HHS calls for identifying ePHI locations, reasonably anticipated threats and vulnerabilities, existing safeguards, likelihood and impact, and documenting and periodically updating the analysis. This document supplies an initial structure; inventory validation and operational evidence remain necessary. [HHS risk-analysis guidance](https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html).

## 2. Asset and data-flow inventory — provisional

IDs are stable references, not new architectural components. All locations, retention periods, data volumes, tenant counts, data owners and actual production vendor accounts are OPEN unless explicitly evidenced below.

| Asset / flow | ePHI or supporting data; direction and boundary | Known basis and unresolved inventory | Proposed custodian |
|---|---|---|---|
| A01 Browser and workforce/patient devices | Users ↔ FE ↔ BE: identity, appointments, clinical records, displayed documents; device downloads and clipboard may retain copies | Next.js FE known; browser persistence, managed-device coverage, local storage, downloads and physical safeguards OPEN | FE lead / IT |
| A02 FE hosting, SSR and HTTP edge | Browser ↔ same-origin session handler or BE; identifiers can enter requests, SSR, caches and host logs | FE repo jairosc23/heydoctor-frontend; session bridge observed. Hosting references include Vercel; actual account, cache behavior, regions and support access OPEN | Platform lead |
| A03 BE and authentication/authorization | FE ↔ Nest API ↔ clinical storage; staff/patient sessions, tenant context, records and mutations | BE repo SAVAC-HeyDoctor/heydoctor-backend-pro; auth and MFA source reviewed. Deployed image and complete endpoint permissions OPEN | BE lead |
| A04 DB and storage | BE ↔ relational DB: identities, clinical records and factor records; documents/object storage if used | TypeORM migration and DB-backed MFA known. Exact DB/storage provider, replicas, exports, volumes and at-rest encryption OPEN | Platform / data lead |
| A05 Clinical AI processing | Clinical content → BE/AI processing → generated clinical suggestions or records; provider boundary if external | AI clinical functionality identified in session; prompts, retrieval/embedding stores, model provider, training use and retention OPEN | AI lead / Privacy lead |
| A06 Telemedicine and messaging | Patient ↔ clinician: video/audio/chat; BE signaling and potential TURN/media vendor boundary | WebRTC and chat identified; relay, recording, transcripts and media-retention inventory OPEN; do not assume recording exists or encryption is end-to-end | Realtime lead |
| A07 Audit, telemetry and operational support | FE/BE → audit/log/error/analytics systems; events, URLs, identifiers and accidental payloads | Audit and redaction code observed; Sentry and Vercel Analytics dependencies seen. Actual enabled sinks, replay, retention, export destinations and access OPEN | Security / observability lead |
| A08 Backups and recovery | DB/files/configuration → backups/replicas → isolated restore or disaster-recovery systems | Backup existence, coverage, key dependency, immutability, recovery times and restore success OPEN | Platform lead |
| A09 Delivery, secrets and administration | Operators/CI/vendors → deployment and data access; production diagnostics → tickets or developer devices | GitHub repos known. ePHI presence in CI, fixtures, tickets and developer machines unverified; privileged access is in scope as a pathway | Platform / Security |
| A10 Notifications, booking, billing and integrations | Clinical workflow → messages, exports, payment/booking vendors or recipients; metadata may reveal care relationship | Booking/payment functionality identified; Payku and Stripe references are candidates, not verified production processors. Email/SMS, integrations and recipients OPEN | Product / Privacy lead |

Inventory completion must identify each environment, region, account, system owner, inbound/outbound interface, ePHI category, retention/deletion rule, backup destination, vendor/subprocessor and emergency/support access path. Verify flows with synthetic data and redacted evidence; do not put patient data or secrets in this repository.

## 3. Evidence and control-state rules

- **IMPLEMENTED — VERIFIED:** operating in the assessed environment with dated, attributable evidence. No production technical control reaches this status in this foundation.
- **VERSIONED — NOT DEPLOYED:** code exists, but the session explicitly states activation has not occurred. No production risk reduction is credited.
- **VERSIONED — DEPLOYMENT OPEN:** source evidence exists; operational state has not been verified.
- **MISSING:** absence is affirmatively established. A missing record in this assessment means missing evidence, not proof a technical control is absent.
- **OPEN:** unknown configuration, missing evidence, unassigned owner or untested effectiveness. OPEN never means PASS. Proposed actions and target residual scores are not implemented controls.

| Evidence ID | Evidence available in this session | Limit / status |
|---|---|---|
| E01 | User reports approved BE main 47918208c126d1222309e0330c7d1363205f2dc6 and explicitly states BE undeployed, migration not run | Reported release state; production independently unverified |
| E02 | BE source at E01 inspected for auth controller/service, MFA enrollment/verify, pending guard and factor migration | Code evidence only; not a runtime, configuration or DB attestation |
| E03 | FE source commit 07b4b09c5fdb7af29e2f62a5070124ae5123a2ef integrated as 0c67a8f96ebe8f0c90616013506735b39bbf9736; push and remote main equality verified during session | Repository state at verification time; not deployment evidence |
| E04 | Isolated FE integration: 24 selected unit tests, 2 MFA component tests and TypeScript check passed | Session tool output; no authenticated BE integration/production E2E, archived CI permalink or signed test report supplied |
| E05 | Earlier MFA patch review reported 0 Critical/High findings; pending JWT held in RAM; local QR generation; redaction keys observed | Narrow source review, not penetration testing, whole-system assurance or audit certification |
| E06 | This three-document foundation | Documentation created and documentation-only consistency review completed; named ownership, human approval and operational verification OPEN |

Current MFA state: **NOT ACTIVATED**. BE and FE are recorded as VERSIONED — NOT DEPLOYED according to the session release/activation context, not a production inspection; no activation was executed here. A repository push does not establish the actual deployed FE version; live deployment attestation remains OPEN. Pending/session separation, TOTP, backup codes and factor encryption logic are source evidence, not proof of deployed protection. MFA key provisioning, migration execution and enrollment remain OPEN. Other observed session, role, audit and sanitizer controls are VERSIONED — DEPLOYMENT OPEN. DB, backup and device encryption are OPEN, regardless of MFA factor encryption code.

Evidence needed for closure must carry artifact ID, controlled location, collector, collection date, environment, commit/image/configuration version, test method, result, reviewer and expiry/revalidation trigger. Store sensitive artifacts in a restricted evidence repository; link only redacted references here. All absent artifact locations are OPEN. The register is authoritative for per-risk evidence requirements.

## 4. Scoring method

This is a proposed internal method, not a statutory HIPAA scoring standard. Evaluate credible scenarios over the next 12 months. Likelihood: 1 rare, 2 unlikely, 3 plausible, 4 likely/repeated exposure, 5 observed or imminent. Impact: 1 negligible, 2 limited/reversible, 3 material but contained, 4 serious disclosure, integrity loss or service interruption, 5 broad disclosure or prolonged loss affecting care. Use the highest credible C/I/A impact, recording the rationale rather than adding dimensions.

Score = likelihood × impact. Critical 20–25; High 12–19; Medium 6–11; Low 1–5. Unknown safeguards receive no risk-reduction credit. Unknown exposure does not automatically imply likelihood 5. Initial likelihoods are provisional judgments requiring inventory, incident history and testing. Ratings are triage estimates, not findings that exploitation occurred.

Inherent risk assumes no credited controls. Current residual is provisionally equal to inherent because production control effectiveness is OPEN. Target residual is a planning objective after mitigation and verification; it is not accepted risk. Targets retain the initial impact and propose only a likelihood reduction. Any later impact reduction requires scenario-specific evidence of reduced harm or exposure; the existence of a control alone does not justify it. Security and clinical/privacy reviewers must approve any re-rating. Missing mandatory obligations cannot be waived by a low numerical score.

## 5. Assessment findings and limits

See [risk register](hipaa-risk-register.md) for 16 scenarios: 0 Critical, 13 High, 3 Medium, 0 Low. All 16 are OPEN. No Critical finding is established by available evidence; this is not evidence that no Critical risk exists. The narrow MFA code-review result does not contradict these operational High risks.

Unresolved release/assurance gates include staff MFA activation and authenticated certification; tenant/patient authorization; AI ePHI use and vendor terms; audit effectiveness; at-rest/transit encryption and key custody; backup/restore; incident response; vendor/BAA determinations; retention, endpoint and production-access evidence. Unknown ePHI inventory prevents asserting completeness.

An authorized Security Officer must validate the inventory with custodians, interview operators, review incident/vulnerability history, inspect redacted configuration evidence, witness control tests and approve the analysis. Scope expansion and changed findings must update both companion documents. No production HIPAA readiness decision follows from document creation.

## 6. Regulatory reference and review governance

The Security Rule addresses administrative, physical and technical safeguards, including risk management, access, audit, contingency and documentation requirements. Addressable specifications require a documented reasonable-and-appropriate evaluation; they are not a blanket exemption. Applicability and any alternative measures require legal/security review. [HHS Security Rule summary](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html).

For cloud services handling ePHI, determine the entity's role and applicable BAA obligations against the actual service and account. Encryption or a vendor marketing claim is not a substitute for this review. [HHS cloud guidance](https://www.hhs.gov/hipaa/for-professionals/special-topics/health-information-technology/cloud-computing/index.html).

Proposed review cadence: quarterly register review, annual full reassessment, and immediate review after incidents, major changes, new vendors/data flows or failed control tests. These are internal proposed intervals. Retain required Security Rule documentation for six years from creation or last effective date, whichever is later; this is distinct from clinical-record retention. Privacy/legal must approve the retention schedule. Source: HHS Security Rule summary linked above. No proposed regulatory amendment is treated as an effective requirement in this foundation.

Approvals: Security Officer OPEN; Privacy/legal OPEN; clinical owner OPEN; platform owner OPEN; executive risk acceptance OPEN. Revision 0.2 records documentation-only review: aligned role accountability, clarified MFA evidence limits and retained initial impact in conditional residual targets. This foundation is ready to version as a draft; organizational approval and operational readiness remain OPEN.
