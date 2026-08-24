# RC-19A Stabilization Sprint 2 — certified baseline

**Status:** CERTIFIED  
**Frozen:** 2026-08-24  
**Branch:** `feat/phase-19a-clinical-workspace-closure`  
**SHA:** `0e512bef339acea3c67a11f4722ed132f0ae00e5`  
**Preview:** https://heydoctor-frontend-git-feat-phase-19-d1c1b5-heydoctors-projects.vercel.app

Sprint 3 remains blocked until explicit authorization to plan P2 only.

## P1 certified

| ID | Result |
|----|--------|
| D2 | PASS — list statuses `En progreso` / `Borrador` |
| D3 | PASS — WhatsApp FAB does not cover «Ver detalle» |
| D4 | PASS — Copilot dims Encounter (`bg-slate-900/45`) |
| D6 | PASS — Medicación activa does not duplicate Losartan |
| D8 | PASS — overflow ⋯ menu opaque and legible |
| Gate D4+D8 | PASS — single overlay surface |
| Smoke Sprint 1 | PASS — consulta → Copilot → ⋯ → Compartir teleconsulta → volver a consultas |

D9 remains out of scope (freeze).

## Frozen surfaces

Any later change requires a new incident ID and explicit authorization.

- `app/panel/consultas/page.tsx`
- `components/GlobalWhatsAppFab.tsx`
- `lib/whatsapp-fab-visibility.ts`
- `app/panel/consultas/[id]/_components/copilot/ClinicalCopilotDrawer.tsx`
- `lib/clinical-workspace/visual-surfaces.ts`
- `components/clinical/continuity/continuity-medication-dedupe.ts`
- `components/clinical/continuity/ContinuityPanelShell.tsx`
- `app/panel/consultas/[id]/_components/EncounterActionMenu.tsx`

Sprint 1 frozen surfaces remain frozen. See `docs/RC-19A_SPRINT_1_CERTIFIED_BASELINE.md`.

## Reproduce

```bash
git checkout 0e512bef339acea3c67a11f4722ed132f0ae00e5
node --import tsx --test \
  lib/encounter/sprint-1-p0.test.ts \
  lib/encounter/sprint-2-d2.test.ts \
  lib/whatsapp-fab-visibility.test.ts \
  lib/encounter/sprint-2-d4.test.ts \
  lib/encounter/sprint-2-d8.test.ts \
  components/clinical/continuity/continuity-medication-dedupe.test.ts \
  lib/clinical-overlay-contract.test.ts
```
