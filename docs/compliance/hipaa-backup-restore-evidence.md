# Backup/PITR and Restore Readiness — evidence checkpoint

Assessment: 2026-09-08 | Status: OPEN / NOT READY FOR RESTORE | No restore or Production mutation performed.

Continues [BR-01](hipaa-backup-restore-control.md) and R06, not a new risk assessment. Collector: Codex via read-only CLI, source inspection and official documentation; independent reviewer and named accountable Platform owner OPEN. No backup objects, patient records, database rows, credentials or raw variable outputs were retained. Service configuration was filtered in memory to non-secret host and archive-variable-name evidence only. Scope of each observation matters: configuration is not runtime effectiveness.

## Verified observations

| Evidence | Method / result | What it establishes / limitation |
|---|---|---|
| BR-O01 | Railway CLI 4.58.0, `status --json`, filtered to environment/service/image metadata | HeyDoctor project c4a53a53-7820-452d-8870-ccee0575c204; production environment 70c5b482-ca99-4a1d-bb0e-1e81f74ad277. Staging a2b64473-7190-4bec-9e6f-95888198cbb0 exists; isolation and restore readiness NOT established |
| BR-O02 | Read-only service-variable inspection, output allowlisted to host and archive-variable names | BE f9ef0cf2-20e1-4173-835d-19588fbe5c3e DATABASE_URL hostname and PGHOST both postgres-q2kh.railway.internal. This maps configured BE DB to Postgres-q2kh; no live SQL connection or active-process configuration proof |
| BR-O03 | Status source-image metadata and production volume listing | Postgres-q2kh service f27c59f1-7032-47b7-a29c-5def2ce1235a, image ghcr.io/railwayapp-templates/postgres-ssl:18, volume 6523ae95-4467-4dac-8706-66b66e2b13b5, mount /var/lib/postgresql/data, 5000 MB allocation, approximately 2320 MB reported used. Engine runtime version, actual encryption and backup coverage OPEN |
| BR-O04 | Same volume inventory | Another production Postgres service 27c677e6-f052-499d-86a0-54cc48012e03 uses postgres-ssl:16 and volume 9191e647-ee07-4128-938c-38c460351c69. It is NOT the configured BE host in BR-O02. Do not select it as source/target based on its generic name |
| BR-O05 | Archive-related variable-name filter on BE and both production Postgres services | No WAL_ARCHIVE*, WAL_RECOVER* or PGBACKREST* variable names returned. Native PITR enablement and archive continuity remain OPEN; absence of these names is not proof that every possible backup mechanism is absent |
| BR-O06 | `railway bucket list --environment production --json` from the linked HeyDoctor repository | Bucket heydoctor-clinical-docs-prod, ID 672df57f-ae4e-4593-8356-92e22fac0f69. Contents, actual clinical usage, encryption, lifecycle and backup coverage NOT inspected. No PITR-named bucket returned; names alone do not establish function |
| BR-O07 | BE source fc4b252cf6cda8d3e05fe2cb02c45127f4d0ec0f, .github/workflows/backup.yml and scripts/backup-postgres.sh | Versioned logical-dump workflow, daily 06:00 UTC schedule, 30-day cleanup setting, PostgreSQL 18 client. Gzip validation plus upload/head request exist in code; execution, destination and recoverability OPEN |
| BR-O08 | Same BE source, scripts/restore-postgres.sh; `bash -n` on backup and restore scripts | Syntax PASS only. Prefix and SQL-failure handling issues below prevent treating the script as a certified restore procedure |
| BR-O09 | Railway MCP environment_status returned Unauthorized; legacy skill API helper found no token in its expected config location; GitHub CLI runs query requires login | These paths could not return backup/schedule inventory or workflow runs. Railway CLI metadata reads succeeded independently. Authentication was not changed; no secrets were exposed |

Read-only metadata outputs were reviewed in-session; the table is a sanitized transcription, not a signed provider export. Artifact collection timestamps more precise than the assessment date and independent attestation remain OPEN. Do not infer an empty backup list from an inaccessible backup API.

## Actual capability decision

- **Backup verified: NO.** Workflow code and a persistent volume are verified; a successful job, backup ID/object, freshness, completeness and decryptability are not.
- **PITR verified: NO.** No enablement, base-backup chain, archive-health or earliest/latest recoverable timestamp evidence obtained. No recovery was attempted.
- **Encryption verified: NO.** The image name contains ssl, but negotiated transport and storage protection were not tested. The versioned uploader at fc4b252c requests ServerSideEncryption=AES256; it does not inspect returned encryption metadata. This is intent, not evidence of actual object, DB, volume or key protection.
- **Retention/access verified: NO.** Code says 30 days; destination lifecycle/object lock, pagination-complete deletion, IAM/owner/delegate reviews, contracts and actual retention window are OPEN.
- **RPO/RTO:** proposed 15-minute core RPO / 4-hour RTO unchanged; approval and measurement OPEN. A daily dump alone cannot establish a 15-minute RPO; completion and scheduling delays can make its exposure longer than a day. No restore timing evidence exists.
- **Restore target ready: NO.** Staging existence does not prove an empty isolated destination, capacity, access, encryption, BAA coverage or blocked side effects. No target has been approved or provisioned.

## Repository findings requiring treatment before any drill

1. **Restore object prefix mismatch:** backup writes postgres-backups/heydoctor_backup_<timestamp>.sql.gz; restore lists/downloads postgres/<filename>. The existing script cannot locate those objects as written without a separately reviewed correction or exact approved alternative. Do not copy/move objects to work around this under the current authorization.
2. **SQL failure reporting:** restore pipes decompressed SQL into psql without ON_ERROR_STOP. Shell pipefail does not establish failure on every SQL error; a partial restore can be labeled complete. Require error-stopping execution and post-restore validation in the future approved procedure.
3. **Target safety:** script relies on DATABASE_URL and a yes/no prompt without verified source/target separation. It imports into whatever database that URL identifies. Its warning is not a target identity safeguard, and this is not a guaranteed clean replacement or atomic restore. Do not execute it against Production.
4. **Retention evidence:** cleanup lists a single object page and treats cleanup exceptions as warnings. A successful backup job therefore cannot prove complete 30-day retention enforcement. Writer/deleter credential permissions and isolation remain OPEN.
5. **TLS and integrity limits:** backup accepts an existing sslmode without enforcing a verified policy; blindly adding `?sslmode=require` can mishandle a URL with existing query parameters. Gzip integrity and head-object existence do not prove SQL completeness, restored integrity or encryption. Full stderr can include sensitive diagnostics; review safe evidence handling before executing.

At the initial checkpoint no scripts were modified or run. The local remediation follow-up below supersedes that work status. These are concrete observations within existing R06/R05/R12/R13 treatment, not new risk IDs. Owner: proposed Platform lead with Security and BE/data reviewers; named owner OPEN. Require an approved provider-specific method or separate code remediation, synthetic failure/target-safety tests, then a separately authorized isolated drill. R06 stays 15 High, conditional residual target 10 Medium; all 16 operational risks remain OPEN.

## Provider documentation — capability, not HeyDoctor attestation

Railway documents volume backup schedules with daily/weekly/monthly retention of 6/27/89 days. Volume restore changes the service's mounted data and is not a harmless read-only drill. The BR-01 proposed 35-day window is an internal target, not a verified native setting. [Volume backups](https://docs.railway.com/volumes/backups).

Railway describes opt-in PostgreSQL PITR using pgBackRest, asynchronous WAL archival and retained full backups. This does not show enablement or achievable RPO here; obtain actual archive timestamps and complete-chain evidence. Enabling PITR changes configuration/deployment and is prohibited in this task. [Point-in-time recovery](https://docs.railway.com/volumes/point-in-time-recovery).

Provider pages describe different recovery paths and contain differing statements about newer-backup handling. Resolve exact service behavior with authoritative account-specific evidence before a restore; do not assume a volume snapshot can be restored directly to a separate environment. [Postgres backup/restore guide](https://docs.railway.com/guides/postgres-backups-restores). Provider documentation alone does not verify encryption, eligibility, a BAA or access control for this account.

## Next evidence gate — no execution authorized

Map BR-E01 to BR-O01–BR-O06 as PARTIAL only. BR-E02–BR-E10 remain OPEN. Obtain: exact volume backup IDs/schedules/freshness and retained points; enabled PITR health/chain or documented alternative; restricted GitHub run metadata and object-head encryption/retention verification; least-privilege owner/delegate review; recovery-key access evidence; approved source/target manifest and isolation/side-effect checks; corrected fail-closed restore method; approved RPO/RTO and drill authorization. Do not fetch raw credentials or ePHI artifacts into Git.

Release baseline caution: earlier documents recorded MFA as not deployed. A later user checkpoint reported Production BE fc4b252c containing MFA with staff login failure. Its eventual correction/current runtime was not verified in this backup review. Use the actual source/schema/key manifest at drill approval; neither a pre-MFA release nor successful MFA activation can be assumed. No MFA state was changed here.

READY RESTORE DRILL REVIEW: NO for an executable drill; YES only for review of these evidence gaps. No restore, backup trigger, env change, deploy or Production write occurred.

## Local remediation follow-up — checkpoint 88ee8acb

Status: local uncommitted changes only; no push, deployment, real backup or restore. Backend fixes are isolated in the workspace `work/backup-fixes`, based on fc4b252cf6cda8d3e05fe2cb02c45127f4d0ec0f. They do not modify the application or MFA. Frontend compliance checkpoint remains 88ee8acb92886dc94f008b5826d5b59e70649c48.

| Gap | Local treatment | Remaining operational evidence |
|---|---|---|
| Restore prefix | Exact timestamp filename; download from the writer's postgres-backups/ prefix | Approved actual backup manifest and destination mapping OPEN |
| SQL error handling | psql -X, ON_ERROR_STOP=1 and single transaction; validate gzip before SQL; generic failure logs, private temporary directory cleaned on exit | Real PostgreSQL import, role/extension compatibility and integrity validation OPEN; transaction is not a sandbox for untrusted dump SQL |
| Target safety | No DATABASE_URL fallback; explicit acknowledgement, loopback heydoctor_restore_* target without URI query overrides, Production environment refusal, empty relation preflight before download | Loopback can be a tunnel; independently verify no Production routing, dedicated instance, restricted role, disk encryption, capacity, egress/jobs disabled and no concurrent writers. This helper does not provision or attest isolation |
| Retention | Validate positive days before I/O, paginate all object pages, fail on cleanup errors | Actual retained history, versioned-object expiry/legal holds and delete privileges OPEN. Existing 30-day default preserved; proposed 35-day policy remains unapproved |
| Backup TLS/object verification | Preserve connection query parameters; require sslmode require/verify-ca/verify-full; check uploaded size and AES256 response metadata | require does not establish server identity; actual negotiated TLS, storage/key protection and provider support OPEN. Unsupported SSE response fails closed; do not infer protection from mocked tests |
| Sensitive diagnostics | Connection URI passed via libpq environment, raw DB/storage errors withheld, private temporary files cleaned | Host/process access and restricted operational troubleshooting/alerting ownership OPEN |

Verification: 14 offline Python unittest cases with simulated psql, pg_dump, pg_isready, AWS CLI and boto3; no real DB or object-store connection. Coverage includes successful prefix/endpoint selection, SQL failure, nonempty/remote/Production/missing target rejection, URI override rejection, corrupt archive, TLS policy, pagination, invalid retention, missing encryption metadata and deletion failure. Shell syntax and whitespace checks accompany these tests. Passing mocks demonstrate local control flow only, not backup recoverability, encryption or RPO/RTO.

Infrastructure recheck: Railway CLI volume metadata read could not refresh OAuth (Operation not permitted), then returned Unauthorized. No authentication/env change attempted. BR-O01–BR-O06 remain prior collected observations, not refreshed attestation; no backup inventory or newly verified capability was obtained. Authorized infrastructure access is required to collect actual backup IDs, PITR chain/window, encryption/key evidence, retention/IAM and named accountable owner/delegate. Unknown remains OPEN.

Executable drill remains blocked: approved source/target manifest, trusted dump provenance, isolated destination proof, named owner/operator/reviewer, vendor/BAA determination, key access, approved RPO/RTO and explicit restore authorization are all required. Do not run this helper merely because the local tests pass. R06 remains OPEN High 15; conditional residual target Medium 10 unchanged. R05/R12/R13 dependencies remain OPEN. All 16 operational risks remain OPEN (0 Critical / 13 High / 3 Medium).
