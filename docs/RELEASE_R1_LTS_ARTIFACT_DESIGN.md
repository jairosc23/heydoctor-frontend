# RELEASE R1 — LTS Artifact · diseño

**Type:** operational design (not implementation)  
**Date:** 2026-08-25  
**Program:** Release Phase · RELEASE 1.0 · R1  
**Source:** `docs/RELEASE_1_PRODUCTION_PLAN.md` · `docs/PRODUCTION_READINESS_ANALYSIS.md`

This document does not modify CORE_PLATFORM, ARCHITECTURE_BASELINE, PRODUCT_PLATFORM v6.0, BUSINESS_APPLICATIONS, HEYDOCTOR_PLATFORM_FINAL_BASELINE, or any certified baseline.

No implementation. No functional code changes. No architecture. No Product Platform. No Business Applications.

**Authorization:** this design does not authorize execution. Wait for explicit authorization before running R1.

R1 is **repository + artifact only**. No runtime, deploy, or production.

---

## Invariantes

- Añadir al git el árbol **ya certificado**. Cero cambios de comportamiento.
- No editar baselines congeladas (ni siquiera “para el tag”).
- No reescribir SHAs certificados (RC-19A Sprint 1 `ef1d7d5c`, Sprint 2 `0e512bef`, Completion `7fcac055` / HEAD `6d6ec01c`).
- No squash del historial RC-19A / Completion.
- No `push --force` a `main`.
- No commitear `.env.local`, secretos, `node_modules`, ni artefactos de build.
- Si CI exige cambiar lógica clínica, comercial o de producto: **STOP**. No es R1.

---

## 1. Estado inicial (evidencia 2026-08-25)

### Rama certificada

| Campo | Valor |
|-------|--------|
| Repo | `heydoctor-frontend` |
| Rama | `feat/phase-19a-clinical-workspace-closure` |
| HEAD local (certificación Completion) | `6d6ec01cd9cb14af9bee9748a211167a11f3c636` |
| vs `origin/feat/phase-19a-clinical-workspace-closure` | **ahead 5** (commits locales no pusheados) |

Los 5 commits locales (solo docs de freeze/certificación, ya creados):

1. `79a0704d` docs: register RC-19A Sprint 2 as certified frozen baseline  
2. `0dcadf14` docs: mark RC-19A as officially frozen pending next-front authorization  
3. `c30007fb` docs: pin RC-19A as the official project resumption point  
4. `7fcac055` docs: register Clinical Completion as certified clinical baseline  
5. `6d6ec01c` docs: pin Clinical Completion certified SHA  

### `main`

| Campo | Valor |
|-------|--------|
| `origin/main` | `7c52178bfdf855428cae2150f7c3d469d8aab048` |
| Merge-base `HEAD` ↔ `origin/main` | `7c52178b` (= tip de `main`) |
| `origin/main`…`HEAD` | **0 behind · 26 ahead** |

`feat/phase-19a-clinical-workspace-closure` **ya contiene** `main`. La integración a `main` puede ser *fast-forward* después del commit de artefacto. No hay desfase de 169 commits sobre esta rama.

Los 26 commits vs `main` son RC-19A + Kernel + Completion (ya en HEAD). No se rehacen.

### Ya en HEAD (no volver a “implementar”)

- `lib/clinical-completion/**`
- `docs/CLINICAL_COMPLETION_CERTIFIED_BASELINE.md`
- `docs/RC-19A_CERTIFIED_STATUS.md` (y baselines RC-19A del historial)

### Working tree — no en HEAD

**1 archivo modificado** (mount certificado de Settlement, +8 líneas; no es feature nueva):

- `app/panel/consultas/[id]/_components/chart/EncounterClosureSection.tsx`  
  import + render de `CommercialSettlementSection` si `isSigned \|\| isLocked`

**Untracked (árbol LTS restante):**

| Clase | Rutas |
|-------|--------|
| Core restante | `lib/commercial-settlement/**`, `lib/clinical-operations/**`, `lib/patient-care-continuity/**` |
| Product v1.0–v6.0 | `lib/product-platform/**` · `app/panel/entrega-clinica/` · `app/panel/integridad-ingresos/` · `app/panel/continuidad-longitudinal/` · `app/panel/brief-previsita/` · `app/panel/pulso-operativo/` · `app/portal/(app)/encounter/` |
| BA Epic 1 | `lib/business-applications/` |
| UI Settlement | `app/panel/consultas/[id]/_components/chart/CommercialSettlementSection.tsx` |
| Baselines / análisis (archivos **nuevos**, no editar LTS existente) | `docs/CORE_PLATFORM.md`, `docs/ARCHITECTURE_BASELINE.md`, `docs/PRODUCT_PLATFORM*.md`, `docs/BUSINESS_APPLICATIONS*.md`, `docs/HEYDOCTOR_PLATFORM_FINAL_BASELINE.md`, epics Product, PCC/COD/Settlement docs, `docs/PRODUCTION_READINESS_ANALYSIS.md`, `docs/RELEASE_1_PRODUCTION_PLAN.md` |

`docs/CORE_PLATFORM.md` y `docs/ARCHITECTURE_BASELINE.md` **no están en HEAD**; añadirlos es registrar el catálogo ya escrito, no modificar una baseline que ya viva en `main`.

### Commits pendientes (R1)

1. Pushear los 5 commits locales al `origin` de la rama feat (hoy no están en remoto).  
2. Un commit (o pila mínima **add-only**) del árbol untracked + el diff de `EncounterClosureSection.tsx`.  
3. PR / fast-forward a `main`.  
4. Tag anotado en el SHA resultante.

Backend **fuera de R1**.

---

## 2. Artefacto LTS

### SHA oficiales (nombres)

| Nombre | Significado | SHA conocido hoy |
|--------|-------------|------------------|
| **SHA-PRE-MAIN** | Tip de producción/`main` **antes** de R1 | `7c52178bfdf855428cae2150f7c3d469d8aab048` |
| **SHA-CERT-HEAD** | Completion + RC-19A certificados; LTS restante aún untracked | `6d6ec01cd9cb14af9bee9748a211167a11f3c636` |
| **SHA-FE-LTS** | Tip **después** del commit add-only + integración a `main` | *asignar al ejecutar R1* |

El artefacto oficial de Release 1.0 es **SHA-FE-LTS**, no `6d6ec01c` (ese SHA no contiene Settlement/Product/BA).

### Limpieza del working tree (procedimiento)

1. Confirmar que no hay `.env.local` ni secretos en `git status`.  
2. Allowlist **sí**: rutas LTS untracked listadas arriba + diff de `EncounterClosureSection.tsx` + docs de proceso Release (`PRODUCTION_READINESS`, `RELEASE_1_PRODUCTION_PLAN`, este diseño).  
3. Allowlist **no**: `.env*`, credenciales, `node_modules`, `.next`, cobertura, reportes Playwright.  
4. `git diff` del único tracked sucio: debe ser **solo** el mount de `CommercialSettlementSection` (+8). Cualquier otra línea → STOP.  
5. No correr formateadores que reescriban LTS. No `npm install` para “arreglar” lockfile.

### Validar diferencias

| Check | Criterio |
|-------|----------|
| vs SHA-CERT-HEAD | Solo adición del árbol certificado + mount Settlement ya diseñado. |
| vs lógica | Cero cambios en Completion ya commiteado; cero refactors. |
| Baselines en disco vs este diseño | Los archivos de baseline se **añaden** enteros; `git diff` sobre ellos debe ser vacío (son untracked). No abrirlos para editar. |

### Consolidación de commits

| Pieza | Estrategia |
|-------|------------|
| 26 commits RC-19A + Completion | **Preserve.** No squash, no rebase, no amend. Los SHA de certificación deben seguir existiendo. |
| 5 commits locales no pusheados | **Preserve + push.** Ya son historia de certificación. |
| Árbol untracked + mount | **Un commit add-only** (preferido) o como máximo una pila mecánica por capa (Core restante / Product / BA / docs) **sin** alterar archivos). Mensaje: higiene de artefacto, no “feat”. |

**Prohibido:** squash de la PR hacia `main`; rebase de la feat sobre un `main` reescrito; `commit --amend` de `6d6ec01c`.

### Estrategia de merge

1. Push de `feat/phase-19a-clinical-workspace-closure` (5 + commit de artefacto).  
2. PR hacia `main`.  
3. Merge: **fast-forward** (`merge --ff-only`) porque merge-base = tip de `main`.  
4. Si GitHub exige merge commit: permitido **solo** si el primer padre es `main` y el segundo es la feat **sin squash**. SHA-FE-LTS = commit resultante en `main`.  
5. **No** squash-merge. **No** rebase-and-merge (reescribe SHA certificados).

Tras el FF, `main` y la feat apuntan al mismo SHA-FE-LTS (o `main` = merge commit hijo de SHA-FE-LTS de feat; documentar cuál es el tagueado).

### Estrategia de tag

- Tag **anotado** `v1.0.0-lts` → **SHA-FE-LTS** en `main`.  
- No mover, borrar ni reanotar `v1.0.0`, `v1.0-auth-stable`, `v1.1.0-rc2`.  
- No taguear `6d6ec01c` como Release 1.0 (árbol incompleto).  
- Push del tag solo después de CI PASS en SHA-FE-LTS.

---

## 3. Versionado

| Plano | Identificador | Política |
|-------|---------------|----------|
| Plataforma (congelada) | CORE LTS · PRODUCT **v6.0** · BA COMPLETE | No se incrementa en R1. No es tag git. |
| Programa de release | RELEASE **1.0** | Este programa operacional. |
| Artefacto git | **`v1.0.0-lts`** | Primera vez que el LTS vive en un SHA de `main`. |

Nomenclatura de tags:

```
v<MAJOR>.<MINOR>.<PATCH>-lts
```

| Evento | Tag |
|--------|-----|
| Este artefacto | `v1.0.0-lts` |
| Parche operacional que **no** cambia LTS (CI, docs de ops) | `v1.0.1-lts` |
| Cambio de LTS | **Prohibido** en esta nomenclatura. Incidente + autorización + nueva certificación. No es un bump `-lts` casual. |
| Histórico `v1.0.0` | Intocable. No es este producto. |

R1 no publica GitHub Release de runtime (eso es proceso de tag existente; R1 solo exige que el tag **exista** y apunte al SHA correcto). El workflow `release.yml` al pushear `v*` no despliega; no se usa para promover producción en R1.

---

## 4. CI

Gates **mínimos** para declarar el artefacto (sobre SHA-FE-LTS). Usar el workflow existente; **no rediseñar** PQ-09. R1 **no acepta** E2E skipped.

| Gate | Comando / job existente | R1 |
|------|-------------------------|----|
| install | `npm ci` (Node 22, `package-lock.json`) | Obligatorio |
| lint | `npm run lint` | Obligatorio |
| typecheck | `npm run typecheck` | Obligatorio |
| unit | `npm test` (+ packs ya en job `quality`) | Obligatorio |
| build | `npm run build` | Obligatorio |
| e2e | `e2e-p0` **y** `e2e-f2-01` en modo `run` | Obligatorio (**secrets presentes**; skip = FAIL de R1) |
| aggregate | job `frontend` | Obligatorio verde |

### E2E obligatorio

El YAML actual permite skip si faltan secrets. Para **PASS R1** eso no cuenta:

- Los 7 secrets P0 y la tríada F2-01 deben estar configurados **antes** de ejecutar R1.  
- `mode=skipped` ⇒ R1-6 FAIL.  
- No se implementa un workflow nuevo en este diseño; se **exige** el modo `run` como criterio de PASS.

Si E2E falla por el árbol LTS add-only: **STOP** (no parchear producto). Si falla por secrets/ambiente: corregir ops, repetir CI, no cambiar LTS.

### Artefacto reproducible

En una máquina limpia:

```text
git checkout <SHA-FE-LTS>
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Mismo `package-lock.json` que en el SHA. No regenerar lockfile. El build no se commitea; se **reproduce**.

`package-lock.json` no debe cambiar en el commit add-only. Si el árbol nuevo exige dependencia no declarada → STOP (eso sería implementación).

---

## 5. Rollback

Objetivo: volver **exactamente** a un SHA conocido, sin force-push a `main`.

| Momento | SHA destino | Cómo |
|---------|-------------|------|
| Antes del commit add-only | SHA-CERT-HEAD `6d6ec01c` | Descartar working tree no commiteado (`git status` limpio respecto a HEAD). No hay que revertir `main`. |
| Commit add-only en feat, no mergeado | Padre del commit add-only (= `6d6ec01c` si fue un solo commit) | Revert del commit en feat, o no mergear la PR. |
| Ya en `main` (FF) | **SHA-PRE-MAIN** `7c52178b` | `git revert` de todos los commits de R1 que no deban quedar en producción, **o** revert del rango `7c52178b..SHA-FE-LTS` vía PR de revert. Preferir revert del **commit add-only** si RC-19A/Completion ya se consideran parte de `main` deseada. |
| Ya en `main` y hay que salir de **todo** el frente 19A | SHA-PRE-MAIN `7c52178b` | PR que restaure ese árbol (revert rango). **No** `push --force` a `main`. |
| Tag publicado por error | — | No mover `v1.0.0-lts`. Publicar nota: tag inválido; nuevo tag solo con autorización. |

Rollback **exacto** al SHA anterior de producción:

```text
anterior = SHA-PRE-MAIN = 7c52178bfdf855428cae2150f7c3d469d8aab048
```

Vercel/Railway no se tocan en R1. El rollback de R1 es **solo git**.

---

## Riesgos

| ID | Riesgo | Mitigación de diseño |
|----|--------|----------------------|
| R1-A | Squash-merge destruye SHA `ef1d7d5c` / `7fcac055` | FF o merge commit; squash prohibido |
| R1-B | Editar baselines “para aclarar el tag” | Allowlist add-only; R1-2 |
| R1-C | E2E skipped y R1 se declara PASS | Skip = FAIL R1-6 |
| R1-D | Formateo masivo del untracked | No prettier/format en R1 |
| R1-E | Meter `.env.local` | Check de status; abort |
| R1-F | Taguear `6d6ec01c` como 1.0 | Tag solo SHA-FE-LTS |
| R1-G | CI pide cambiar Completion/Settlement | STOP; incidente, no R1 |
| R1-H | Force-push rollback | Prohibido; revert por PR |

---

## PASS (criterios — no ejecutados)

Este diseño **define** R1-1…R1-8. Hasta autorización y ejecución, el estado de cada uno es **FAIL** (no corrido).

| ID | Criterio | Evidencia esperada al ejecutar |
|----|----------|--------------------------------|
| **R1-1** | Working tree limpio | `git status` vacío en SHA-FE-LTS; sin untracked LTS |
| **R1-2** | Ninguna baseline modificada | Diff de archivos de baseline = add de archivo nuevo o vacío; cero edits a baselines ya en HEAD; CORE / Product v6.0 / BA / Architecture / Final Baseline no reescritos |
| **R1-3** | SHA oficial identificado | SHA-FE-LTS publicado; distinto de `6d6ec01c`; `git ls-files` incluye Settlement, COD, PCC, Product, Digital Clinic y rutas `/panel/*` LTS |
| **R1-4** | Merge strategy definida | FF-only (o merge commit sin squash) documentada y aplicada; 26 commits preserve |
| **R1-5** | Tag strategy definida | `v1.0.0-lts` anotado en SHA-FE-LTS; `v1.0.0` intocado |
| **R1-6** | CI obligatorio definido | install, lint, typecheck, unit, build, e2e P0 + F2-01 en `run`, aggregate `frontend` verde |
| **R1-7** | Rollback documentado | Destino SHA-PRE-MAIN y SHA-CERT-HEAD; procedimiento revert; sin force-push |
| **R1-8** | Artefacto reproducible | `npm ci` + lint + typecheck + test + build en checkout de SHA-FE-LTS; lockfile sin cambio en el commit add-only |

---

## Fuera de R1

Runtime, variables, secrets de prod, migraciones, deploy, health, backups, QA de punta, onboarding. Eso es R2–R5.

---

## Cierre

R1 transforma el working tree certificado en **SHA-FE-LTS** + tag `v1.0.0-lts` sobre `main`, sin tocar LTS.

**No implementar. Esperar autorización explícita.**
