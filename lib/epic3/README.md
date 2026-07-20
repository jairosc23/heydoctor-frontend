# EPIC-3 frontend contract (technical)

SSOT module: [`architecture-contract.ts`](./architecture-contract.ts)

- Daily Hub allowlist + HITL act names
- Lab surface flag: `NEXT_PUBLIC_MEDICAL_COPILOT_LAB_SURFACE` (default ON)
- Enforced by `daily-hub-allowlist.test.ts`

## UC-01 Pre-visit

- [`pre-visit-context.ts`](./pre-visit-context.ts) — read-only view-model
- [`resolve-agenda-context.ts`](./resolve-agenda-context.ts) — Agenda link via existing `/appointments`
- UI: `CopilotPreVisitContext` inside Daily Hub drawer
- Hook: `hooks/useDailyHubPreVisit.ts` (Foundation + Agenda + session bootstrap)

## UC-02C Pre-Visit Clinical Snapshot

- [`pre-visit-clinical-snapshot.ts`](./pre-visit-clinical-snapshot.ts) — deterministic projection of Foundation fields
- UI: `CopilotPreVisitClinicalSnapshot` (no LLM, no free text, no EMR)

## UC-02A Pre-Visit Quality Signals

- [`pre-visit-quality-signals.ts`](./pre-visit-quality-signals.ts) — deterministic Presente/Faltante/No disponible
- UI: `CopilotPreVisitQualitySignals` (no LLM, no EMR writes)

## UC-03A Clinical Context Timeline (Live)

- [`live-clinical-context-timeline.ts`](./live-clinical-context-timeline.ts) — merge Foundation/Consultation + MC timeline
- Hook: `hooks/useLiveClinicalContextTimeline.ts` (GET session timeline)
- UI: `CopilotLiveClinicalContextTimeline` (read-only, chronological)

## UC-03B Documentation Quality Assistant (Live)

- [`live-documentation-quality.ts`](./live-documentation-quality.ts) — Completado / Pendiente / No disponible
- UI: `CopilotLiveDocumentationQuality` (no LLM, no recommendations)

## UC-03C Real-Time Clinical Insights (Live)

- [`live-clinical-insights.ts`](./live-clinical-insights.ts) — AiService assist payload + map
- [`live-clinical-insights-session.ts`](./live-clinical-insights-session.ts) — sessionStorage by sessionId
- Hook: `hooks/useLiveClinicalInsights.ts`
- UI: `CopilotLiveClinicalInsights` (discard / regenerate; no EMR)

## UC-02B Suggested Interview Questions

- [`interview-suggestions.ts`](./interview-suggestions.ts) — AiService assist payload + map
- [`interview-suggestions-session.ts`](./interview-suggestions-session.ts) — sessionStorage by Medical Copilot sessionId
- Hook: `hooks/useSuggestedInterviewQuestions.ts`
- UI: `CopilotSuggestedInterviewQuestions` (edit / discard / regenerate; no EMR)

## UC-04A Clinical Review Workspace (Close)

- [`clinical-review-workspace.ts`](./clinical-review-workspace.ts) — section registry + review meta (no EMR)
- UI: `CopilotClinicalReviewWorkspace` — orchestrates UC-01…UC-03C surfaces only

## UC-04B Review & Selection Layer (Close HITL)

- [`review-selection.ts`](./review-selection.ts) — accept / edit / discard over EPIC-3 session items
- [`h1-ai-run-review.ts`](./h1-ai-run-review.ts) — H1 `POST /ai/runs/:id/approve|reject`
- [`review-selection-session.ts`](./review-selection-session.ts) — session mirror after H1 (not sole SoT)
- Hook: `hooks/useReviewSelectionLayer.ts`
- UI: `CopilotReviewSelectionLayer` (no AI regen, no EMR)

Official ADR (backend docs): `docs/architecture/ADR-EPIC-3-CLINICAL-COPILOT-DAILY-VALUE.md`

## UC-04C Persistence Preview (Close, preview_only)

- [`persistence-preview.ts`](./persistence-preview.ts) — payload from UC-04B accepted/edited only
- UI: `CopilotPersistencePreview` (shows all decisions + candidate JSON; never executes H3)

## UC-04D Persistence Execution + Clinical Signature (Close H2→H3→H4)

- [`close-hitl-execution.ts`](./close-hitl-execution.ts) — H2 approve, H3 SOAP writer, H4 sign
- [`close-hitl-session.ts`](./close-hitl-session.ts) — session audit trail
- Hook: `hooks/useCloseHitlExecution.ts`
- UI: `CopilotCloseExecution` (no `governed-` token in Daily Hub surface)

See backend: `heydoctor-backend-pro/docs/architecture/EPIC-3-ARCHITECTURE-CONTRACT.md`
