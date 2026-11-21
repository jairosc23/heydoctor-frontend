# RC12 combined candidate — offline only, runtime BLOCKED

Composition is pinned in `rc12-candidate-sources.json`: #142 includes #140;
#141's seven-file patch is applied without conflicts. The source PRs remain
unchanged and unmerged. This branch is a review candidate, not a release approval.

## Historical webhook preservation

The historical Test account `acct_1U9vSWF0JO4ODWl1` has the active destination
`we_1UCQj0F0JO4ODWl1dfOc7M9e` at
`https://staging-api.heydoctor.health/api/payments/webhook/stripe`.
It must not be disabled, repointed, deleted or reused for RC18 to obtain a green gate.
Two active endpoints listening to the same payment event types in the same Test
context do not demonstrate isolation. Payment metadata/clinic IDs are correlation,
not a Stripe delivery boundary. The exclusive-destination gate is NOT weakened.

The candidate now rejects that historical account even if an operator supplies it
as the QA ID. It requires an explicitly approved, distinct isolated Stripe sandbox
context, its own Test key, and a complete inventory containing only the enabled QA
destination. Stripe GET account identity, balance/session `livemode=false` and
runtime key fingerprint must all agree. No alternate sandbox is claimed to exist.
If one is unavailable, the result is BLOCKED; resource creation would require a
separate explicit decision, not an automatic fallback or duplicate account.

## Minimal workflow publication and least privilege (not performed)

1. Review this immutable candidate SHA and the workflow diff. Separately approve
   publication of only the workflow YAML to the default branch; no product merge,
   deployment, push trigger or transaction is implied. GitHub requires a default-
   branch workflow for dispatch, then permits selecting the candidate ref.
2. Before any authorized financial dispatch, an owner must verify/configure the
   protected `rc12-stripe-qa` GitHub environment: only the candidate branch/tag,
   required independent reviewer, prevent self-review, and no admin bypass. Verify
   plan/repository support; if these controls are unavailable, stop rather than
   granting an exception. It must exist with protections before use, not be
   auto-created unprotected by a workflow run.
3. Keep all Stripe/doctor/SSH credentials environment-scoped, not repository-wide.
   Do not create or broaden credentials here. Existing runtime access exported to
   CI must be restricted to QA; never provide an account/workspace credential that
   exposes production. SSH scope/support is an access prerequisite, not inferred
   from the secret name. Unavailable least-privilege access means BLOCKED.
4. Set the nonsecret repository variable `RC12_APPROVED_CANDIDATE_SHA` only after
   reviewing the exact 40-character SHA. An authorized dispatch with a different
   or missing approval SHA fails in offline quality before environment secrets.
   The runtime preflight independently enforces the same equality.
5. `GITHUB_TOKEN` remains `contents: read`; checkout does not persist credentials.
   No actions/write, deployments/write, id-token/write, write-all,
   pull_request_target, reusable workflow from an unpinned ref or automatic deploy.
   Environment `deployment: false` retains required reviews without creating a
   deployment record. Secret values are exposed only to guarded read/test steps,
   never dependency installation; raw diagnostics are not uploaded.
6. Dispatch on the approved candidate ref with default `NO_TRANSACTION` for
   offline quality. A later separate authorization selects the fixed Test-only
   transaction option. The protected environment review is still required.

Neither workflow publication nor GitHub environment/variable/secret changes were
performed during candidate preparation. Publication and protection setup require
owner approval; publishing the YAML alone is not authorization to run payments.

## Exact SHA binding

The candidate commit SHA is recorded in its PR/commit URL after creation; it is
not embedded into itself. Approve and deploy that immutable SHA, never just a
branch name. Record Railway frontend deployment ID, successful SHA and backend
baseline. The workflow runs checkout at `GITHUB_SHA`; before any financial UI,
the probe requires `GITHUB_SHA == RC12_APPROVED_CANDIDATE_SHA ==` the frontend's
effective `RAILWAY_GIT_COMMIT_SHA`, and the backend remains `35216b4f...`.
It also verifies QA origins, edge mode, deployment identities and the return route
marker. Any code change after approval requires new validation/approval/deployment.
No SHA equality with the currently deployed frontend is claimed here.

## Candidate offline evidence

- Preflight: 11/11; executor authorization and return contract: 5/5.
- Return UI and clinical signature regression components: 25/25; no skipped tests.
- TypeScript and repository `lint` (currently `tsc --noEmit`): PASS. No separate
  ESLint execution is claimed by that repository script.
- Optimized build: PASS on retry after the baseline Next.js security advisory
  stopped the first command; no dependency change or protection suppression.
- Workflow YAML/least-privilege structure and `git diff --check`: PASS.
- Playwright discovery: exactly one P0-4. Discovery is NOT execution.

No Stripe/SSH runtime preflight, Checkout, event replay, GitHub dispatch,
workflow publication, environment change or deployment was performed.

## Dependencies and separate authorizations

| Gate | Dependency / criterion | Authorization required |
| --- | --- | --- |
| Review candidate | Pinned #140/#141/#142, offline type/lint/build/tests, source diff | Review only; source PRs remain drafts |
| Workflow publication | YAML-only default-branch publication and protected QA environment verified | Explicit owner approval; no product merge or transaction |
| QA frontend deployment | Exact approved candidate SHA, backend baseline and isolated namespace | Explicit QA deployment; no production |
| Stripe Test configuration | Distinct approved sandbox context, QA-only destination and matched Test/signing keys; historic endpoint untouched | Specific configuration/resource decision; no current changes |
| QA runtime guard | Allow Test credentials only while retaining Live/Connect/Payku/mocks/email prohibitions | Specific QA guard/config approval; no security relaxation |
| Runtime preflight | QA-only existing access, complete destination inventory, immutable SHA/key correlation | Read-only execution approval, no event or payment |
| One synthetic payment | Preflight PASS and protected review, synthetic SIGNED consultation, fixed 15000 CLP Test session | Separate one-transaction Test authorization |
| Idempotent replay | Same real Test event/transaction; PAID, one outbox/accounting effect and SIGNED→LOCKED verified before/after | Separate same-event resend authorization; no fabricated event |

Runtime readiness remains BLOCKED until the isolated sandbox, protected execution
context, candidate deployment and effective configuration are demonstrated. Local
tests do not certify webhook delivery, accounting, idempotency or clinical closure.
The previously documented baseline Next.js advisory still requires a separate
launch risk decision; dependencies are unchanged by this candidate.

Sources: https://docs.stripe.com/sandboxes ;
https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow ;
https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments ;
https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments .
