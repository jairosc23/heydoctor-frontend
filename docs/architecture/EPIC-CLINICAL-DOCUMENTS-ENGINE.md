# EPIC — Clinical Documents Engine

| Field | Value |
|---|---|
| **Status** | **CLOSED** |
| **Closed** | 2026-08-13 |
| **ADRs** | ADR-021, ADR-022 (backend) |
| **Frontend SHA (D6)** | `05a62f8127190904496a7b2c6843aba4fbfd8928` |
| **Backend SHA (D5)** | `e724ff9f002fd8482db35bd54fbedac9dbebe6e4` |
| **Production `origin/main`** | `7334ae1dcb9087afb34f48203d0975cac7885c0f` (aún sin este EPIC) |

---

## Close-out

Encounter §21 **Clinical Documents** consume exclusivamente:

- `GET /api/clinical-documents/:type/preview`
- `GET /api/clinical-documents/:type/pdf`

No reconstruye modelos, no consulta Clinical Foundation, no toca Copilot, Continuity, Autosave, Unsaved Changes Guard, Legal PDF ni Patient Longitudinal Profile.

PR: [#106](https://github.com/jairosc23/heydoctor-frontend/pull/106).

Documentación canónica del EPIC (flujo, desacoplamiento, riesgos): backend `docs/architecture/EPIC-CLINICAL-DOCUMENTS-ENGINE.md`.

---

## Producción READY

Lista para merge. La UI D6 requiere D5 desplegado en API; contra producción actual los endpoints nuevos no existen.

## Trabajo pendiente (fuera de D6)

Merge + deploy. D7 no forma parte de este cierre.
