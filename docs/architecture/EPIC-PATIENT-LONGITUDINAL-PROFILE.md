# EPIC — Patient Longitudinal Profile

| Field | Value |
|---|---|
| **Status** | **CLOSED** |
| **Production smoke** | **PASS** (2026-08-13) |
| **Regressions** | **NONE** |
| **Open risks** | **NONE** blocking. Residual documented: Browser Back is not intercepted (App Router; native `beforeunload` only). |
| **Frozen peers** | Medication Platform v1.0 / ADR-020 — untouched |
| **Out of scope (unchanged)** | Continuity Phase 2 · PDF Premium · SoT B · Clinical AI · Medication Domain / CDS / FHIR |

---

## Close-out

Patient Profile antecedents persist through `PUT/GET /api/patients/:id/profile`, stay synchronized in Encounter and Full Record, and navigation uses an Unsaved Changes Guard instead of a global lock.

RCA verdict (closed): **A** — Nest `ValidationPipe` + `@IsArray()` + `enableImplicitConversion` coerced JSONB `{label}` items to `[[]]`. Fixed in backend PR #97 (`@Type(() => Object)`). Frontend then completed family/habits, bidirectional sync, persist FSM, and the nav guard.

---

## Production alignment

| Item | SHA |
|---|---|
| Frontend merge of PR #103 | `38e8595e1f7c5eba121914611c4e563b75da7fc0` |
| Vercel Production deploy of #103 | `38e8595e1f7c5eba121914611c4e563b75da7fc0` (GitHub deployment `5835618734`, 2026-08-10T16:13:20Z) |
| `origin/main` (frontend) | `5f40812e63cecc7acabd33f1187e8da136d3a547` |
| Vercel Production current | `5f40812e63cecc7acabd33f1187e8da136d3a547` (deployment `5844023043`) |
| Backend merge of PR #97 / `origin/main` | `0e06a69f075bd695d202223b7c7d19f363bc6266` |

`main` is synchronized with current Production. Production contains #103 (`38e8595e` is an ancestor of `5f40812e`; two later commits are #104 Continuity layout — out of this EPIC — and #105 encounter nav dirty-state).

---

## PRs that closed this EPIC

| PR | Repo | Merge SHA | State |
|---|---|---|---|
| [#99](https://github.com/jairosc23/heydoctor-frontend/pull/99) docs(epic): RCA gate | frontend | `05d6118373cae07686cf966ceba10f50daca6eeb` | MERGED |
| [#101](https://github.com/jairosc23/heydoctor-frontend/pull/101) PR-A preserve surgeries/disabilities on flush | frontend | `39c965a29773b85442831377c99c5ac4d805dc90` | MERGED |
| [#102](https://github.com/jairosc23/heydoctor-frontend/pull/102) PR-B persist FSM | frontend | `8c1d0a159760e5c0a8d3d40d6b5384b0db44b823` | MERGED |
| [#97](https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/pull/97) JSONB `@Type(() => Object)` | backend | `0e06a69f075bd695d202223b7c7d19f363bc6266` | MERGED |
| [#103](https://github.com/jairosc23/heydoctor-frontend/pull/103) family/habits sync + Unsaved Changes Guard | frontend | `38e8595e1f7c5eba121914611c4e563b75da7fc0` | MERGED |
| [#105](https://github.com/jairosc23/heydoctor-frontend/pull/105) ignore autosave transient dirty for nav | frontend | `5f40812e63cecc7acabd33f1187e8da136d3a547` | MERGED |

Not in this EPIC: frontend [#104](https://github.com/jairosc23/heydoctor-frontend/pull/104) (Continuity portal layout).

---

## Delivered scope

- Alergias, medicamentos, condiciones crónicas, antecedentes familiares, hábitos on Patient Profile (`PUT /patients/:id/profile`).
- Bidirectional Encounter ↔ Profile sync; Full Record projects family + habits.
- Unsaved Changes Guard: Cancelar / Guardar y salir / Salir sin guardar (literal discard via PersistGate).
- Copilot UC-01 usable beside sidebar (`md:left-64`); overlay z-index contract unchanged.

---

## Explicit non-goals (still closed)

- No Medication Platform / ADR-020 changes.
- No Continuity Phase 2.
- No PDF Premium / SoT B / Clinical AI.
