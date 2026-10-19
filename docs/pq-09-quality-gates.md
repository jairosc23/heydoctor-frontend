# PQ-09 — CI/CD Quality Gates

**Épica:** EPIC 1C  
**Iniciativa:** PQ-09 (redefinida como Quality Gates; no Copilot mock suites)  
**Fecha:** 2026-07-17  
**Repos:** `feature/v1.1-platform-evolution`  
**Repos FE:** `jairosc23/heydoctor-frontend`  
**Repos BE:** `SAVAC-HeyDoctor/heydoctor-backend-pro`  
**Dependencia:** PQ-01 Playwright P0 Hardening  
**Modo:** Solo pipelines / docs. Sin lógica de negocio. Sin deploy.

---

## 1. Archivos modificados

### Frontend

| Archivo | Cambio |
|---------|--------|
| `.github/workflows/ci.yml` | Jobs `quality` → `e2e-p0` → aggregate `frontend` |
| `.github/workflows/release.yml` | Job `release-gates` (L3 checklist) + release |
| `docs/pq-09-quality-gates.md` | Este documento |
| `docs/pq-09-quality-gates.json` | Evidencia machine-readable |

### Backend

| Archivo | Cambio |
|---------|--------|
| `.github/workflows/ci.yml` | Jobs `quality` → `test` → aggregate `backend` + notify |
| `.github/workflows/release.yml` | Job `release-gates` (L3 checklist) + release |

Sin cambios en código de aplicación.

---

## 2. Cambios realizados

1. **Jobs separados** por latencia y fallo rápido (L1 sin E2E/DB pesado).  
2. **Aggregate checks** conservan nombres `frontend` / `backend` para branch protection existente.  
3. **E2E P0** aprovecha PQ-01 (`test:e2e:p0`, artefactos, `E2E_STRICT`) con degradación si faltan secrets.  
4. **Cache npm** + `timeout-minutes` + `workflow_dispatch`.  
5. **Release L3** documenta checklist sin desplegar.  
6. **Slack BE** permanece opcional (no-op sin webhook).

---

## 3. Diseño de Quality Gates

```text
PR / push → main
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│ L1 quality  │────►│ L2 e2e/test  │────►│ Aggregate      │
│ (always)    │     │ (cond./always│     │ frontend|backend│
└─────────────┘     │  per repo)   │     └────────────────┘
                    └──────────────┘

Tag v* → Release workflow
┌─────────────────┐     ┌──────────────────┐
│ L3 release-gates│────►│ GitHub Release   │
│ (checklist log) │     │ (no deploy)      │
└─────────────────┘     └──────────────────┘
```

### Frontend

| Job | Rol | Falla el aggregate si… |
|-----|-----|-------------------------|
| `quality` | lint/tsc/build/unit | No `success` |
| `e2e-p0` | Playwright P0 | Secrets presentes **y** E2E fail |
| `frontend` | Required check | L1 fail o L2 fail (no por skip) |

### Backend

| Job | Rol | Falla el aggregate si… |
|-----|-----|-------------------------|
| `quality` | format/lint/build | No `success` |
| `test` | migrate + unit + API e2e | No `success` |
| `backend` | Required check | L1 o L2 fail |
| `notify` | Slack opcional | Nunca bloquea merge |

---

## 4. Distribución por niveles

### Nivel 1 — Obligatorias en cada Pull Request

| Repo | Verificaciones | Criterio |
|------|----------------|----------|
| FE | `npm run lint`, `typecheck`, `build`, `npm test` | Debe ser verde. Sin secrets. |
| BE | `format:check`, `lint:ci`, `build` | Debe ser verde. Sin Postgres en este job. |

**Criterio L1:** el código compila, tipa y pasa calidad estática/unit FE; BE formateado/lint/build.  
Bloquea el aggregate si falla. Aplicable a forks (sin secrets).

### Nivel 2 — Obligatorias antes de merge a `main`

| Repo | Verificaciones | Criterio |
|------|----------------|----------|
| FE | Playwright P0 (`test:e2e:p0`) | **Si** los 7 secrets existen → debe PASS. **Si no** → `skipped` (degradación controlada; merge permitido solo en entornos sin secrets; **no** recomendado para main protegido de la org). |
| BE | migrations + `npm test` + `DATABASE_E2E=1 test:e2e` | Debe PASS siempre (Postgres de servicio CI; sin secrets externos). |

**Criterio L2:** confianza de integración. BE siempre estricto. FE estricto cuando hay secrets; degradación documentada si no.

**Branch protection recomendada:** exigir checks `frontend` y `backend` (aggregates).

### Nivel 3 — Obligatorias para una Release (`v*`)

| Verificación | Criterio |
|--------------|----------|
| Aggregate CI verde en el commit taggeado | `frontend` / `backend` PASS |
| FE: L2 E2E **no** skipped | Secrets configurados y P0 PASS |
| BE: L2 test PASS | migrations + e2e API |
| Ops: `migration:show` / smoke `/health/version` | Tip alineado (manual/ops; fuera de GHA deploy) |
| Sin Sev-1/2 abiertos en Auth/Agenda/Copilot | Criterio de release notes / ops |

**Criterio L3:** checklist en job `release-gates` (log). **No** ejecuta deploy ni smoke prod automáticamente (restricción PQ-09).

---

## 5. Estrategia de secretos

| Secret | Repo | Uso | Si ausente |
|--------|------|-----|------------|
| `E2E_BASE_URL` + doctor + 4 UUIDs | FE | L2 Playwright P0 | Job `e2e-p0` → `mode=skipped`; aggregate **PASS** con notice |
| `SLACK_WEBHOOK_URL` | BE | Alerta CI fail | Notify no-op |
| Ninguno para L1 | ambos | — | L1 siempre ejecuta |

**Política:** el pipeline **nunca** falla por secretos inexistentes en L1.  
L2 FE **sí** falla si secrets existen y E2E rompe (gate real).  
Para main de la org: configurar los 7 secrets para que L2 no degrade.

Artefactos FE (si L2 corre): `playwright-p0-<run_id>` (report/traces), retention 14 días.

---

## 6. Validaciones ejecutadas

| Check | Resultado |
|-------|-----------|
| YAML workflows escritos / estructura jobs | **PASS** (revisión estática) |
| Nombres aggregate `frontend` / `backend` preservados | **PASS** |
| Degradación sin secrets (diseño) | **PASS** (misma política PQ-01) |
| Ejecución Actions en GitHub | **No ejecutada** (sin push; rama local) |
| Lógica de negocio intacta | **PASS** (solo `.github` + docs) |

Validación runtime: al abrir PR a `main` o `workflow_dispatch` tras push de la rama.

---

## 7. Riesgos remanentes

| ID | Riesgo | Mitigación |
|----|--------|------------|
| R1 | Main org sin secrets → L2 FE skipped en aggregate PASS | Configurar 7 secrets; checklist L3 exige E2E no skipped |
| R2 | P0-4 Payku skip (PQ-01 L1) | Documentado; no bloquea necesariamente suite |
| R3 | Branch protection aún apunta solo a job monolítico antiguo | Aggregates mantienen nombre; jobs nuevos son informativos |
| R4 | BE `test` re-build aumenta minutos CI | Trade-off jobs paralelizables a futuro; cache npm |
| R5 | L3 checklist no es enforced automáticamente | Intencional (no deploy en PQ-09) |

---

## 8. GO / NO GO — adopción

### **GO**

Adoptar los nuevos workflows como Quality Gates de v1.1:

- L1 siempre.  
- L2 BE siempre; L2 FE con secrets.  
- Aggregate checks para protección de `main`.  
- L3 checklist en tags.

### Condiciones operativas

1. Configurar secrets E2E en el repo FE de la org.  
2. Confirmar branch protection → required: `frontend`, `backend`.  
3. No tratar L2 FE skipped como “release-ready”.

---

## 9. Certificación PQ-09

| Criterio | Resultado |
|----------|-----------|
| Gates claros L1/L2/L3 | **PASS** |
| Aprovecha PQ-01 | **PASS** |
| Sin dependencia hard de secrets inexistentes | **PASS** |
| Sin negocio / deploy / prod | **PASS** |
| Docs | **PASS** |

### **PASS — PQ-09 CI/CD Quality Gates**

**STOP.** Esperar autorización explícita para la siguiente iniciativa Platform Quality.
