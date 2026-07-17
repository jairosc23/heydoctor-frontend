# HeyDoctor — Production Readiness Consolidada

## Pregunta

¿Medical Copilot + Agenda Enterprise están listos para producción **como un único producto / un único deploy**?

### Veredicto

| Escenario | Decisión |
|-----------|----------|
| Certificación por producto en su rama | **GO** (ya certificado) |
| Release unificado único tag | **NO GO** |
| Deploy plataforma con promoción controlada y smokes separados | **GO condicionado** |
| Deploy automático desde esta auditoría | **NO GO** (no merge / no deploy) |

---

## Condiciones GO (plataforma)

1. Reconciliar divergencia Git FE (+10/−5) y BE (+5/−6) entre `release/medical-copilot-v1.0-rc2` y `feature/agenda-enterprise`.  
2. Migraciones Agenda aplicadas en target (rules/blocks/waitlist/reminders/timezone).  
3. Stack AI / Copilot RC2 intacto post-merge.  
4. Smoke staging: `/panel/agenda` + `/panel/consultas/[id]/medical-copilot`.  
5. Kill switch Copilot verificado.  
6. Variables Vercel/Railway correctas.  
7. Playwright crítico con `.env.e2e` en staging (esta auditoría: **no ejecutado con credenciales**).  
8. Aprobación humana merge + deploy.

---

## Matriz de readiness

| Dimensión | Copilot | Agenda | Conjunto |
|-----------|---------|--------|----------|
| Funcional | Certificado RC6/POST-RC6 | Certificada F1–F10 | Dual |
| Seguridad | JWT/RBAC/ownership/kill | JWT/RBAC/clinic/doctor | Compartida madura |
| Persistencia | Efímero + AI DB | PostgreSQL scheduling | Heterogénea |
| Ops docs | RC + runbooks | F10 guides | Completas separadas |
| Flags | FE kill + FeatureGuard | Sin flag dedicado | Asimétrico |
| E2E esta corrida | Blocked env | N/A dedicado | Gap |

---

## Deployment model

| Orden | Acción |
|-------|--------|
| 1 | Merge/reconcile branches (humano) |
| 2 | Migrate BE Railway |
| 3 | Deploy BE |
| 4 | Deploy FE Vercel |
| 5 | Smoke Copilot + Agenda |
| 6 | Decisión GO producción |

Rollback: FE independiente; BE con cuidado de migraciones aditivas Agenda; Copilot kill switch para incidentes AI.

---

## Riesgos que bloquean unificación

1. Dual-branch no reconciliado.  
2. Sesiones Copilot in-memory multi-réplica.  
3. Playwright crítico sin credenciales en esta auditoría.  
4. Reminders Agenda sin proveedor de envío.  
5. Dos superficies AI en consulta (UX/ops).

---

## Explicit non-starts

No v2 · no IA nueva · no Agenda v2 · no Marketplace · no Analytics · no merge · no deploy · no promotion desde esta fase.
