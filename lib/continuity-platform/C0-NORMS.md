# PR-9 CCP Wave C0 — Frontend Norms (S1 · S3 · S5)

## S1 — `therapeutic_asset` wire-compat

`toClinicalAssistPrefillDraftFromContinuityHint` sets
`sourceAssetType: "therapeutic_asset"` **only** so PR-8 M2 Intake Gate accepts the draft.

**Authoritative provenance** is always `hint.provenance` (`HintProvenance.kind`), e.g.
`continuity_active_medication`. Retain it in
`extensions.continuityHintProvenance` when hydrating Composer.

Do not treat Continuity hints as TK asset writes. TK remains Frozen.

## S3 — validate-echo vs assertContinuityHydrationDraft

| Origin | Gate before `hydrateFromAssistDraft` |
|--------|--------------------------------------|
| `clinical_protocol` | `validateAssistIntakeEcho(draft)` (BE) |
| Continuity active / timeline / manual | `assertContinuityHydrationDraft(draft, hint)` (FE) — skip validate-echo |
| TK-shaped drafts | validate-echo when using standard TK provenance |

See `hydration-policy.ts`.

## S5 — Observability

Client must not console.log medication names, dosages, diagnosis, or notes from Continuity Context.
Log only counts / reasonCodes.
