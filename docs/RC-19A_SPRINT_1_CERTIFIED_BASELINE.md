# RC-19A Stabilization Sprint 1 — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-24  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**SHA:** `ef1d7d5cba5c6cc933287e30e9c76b125271443a`  
**Preview deploy:** `heydoctor-frontend-n41n7grm7-heydoctors-projects.vercel.app`

Sprint 2 remains blocked until explicit authorization.

## P0 certified

| ID | Result |
|----|--------|
| D1 | PASS — logout not covered by Feedback |
| D17 | PASS — camera uses `openWorkspaceShare` |
| D18 | PASS — sidebar usable during Encounter |
| D19 | PASS — ← Consultas / Salir sin guardar lands on `/panel/consultas` |

INC-001 (React #185) and INC-002 (React #310) are closed on this SHA.

## Frozen surfaces

Any later change requires a new incident ID and explicit authorization.

- `components/PanelLayout.tsx`
- `lib/unsaved-changes-guard/**`
- `components/unsaved-changes/**`
- `components/clinical/ShareConsultationDialog.tsx`
- `components/clinical-beta/ClinicalBetaFeedbackWidget.tsx`
- `lib/clinical-overlay-contract.ts`
- D1 / D17 / D18 / D19 wiring in `app/panel/consultas/[id]/page.tsx`
- `lib/encounter/sprint-1-p0.test.ts`

## Reproduce

```bash
git checkout ef1d7d5cba5c6cc933287e30e9c76b125271443a
node --import tsx --test lib/encounter/sprint-1-p0.test.ts
```
