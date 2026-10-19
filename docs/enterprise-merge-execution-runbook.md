# HeyDoctor Enterprise — Merge Execution Runbook

> **ESTADO:** Preparado · **NO EJECUTAR** sin autorización explícita  
> Productos: Medical Copilot (`release/medical-copilot-v1.0-rc2`) + Agenda Enterprise (`feature/agenda-enterprise`)  
> Precondiciones certificadas: Enterprise Audit PASS · Merge Readiness PASS · Pre-Merge Validation PASS · `git merge-tree` CLEAN  

---

## Autorización (obligatoria)

Antes de cualquier comando de merge:

1. Aprobación escrita del owner de release.  
2. Confirmar que nadie más empuja a las dos ramas.  
3. Registrar en ticket: fecha, operador, SHAs tip al inicio.

**Sin estos tres puntos → STOP.**

---

## Baselines de referencia (revalidar al ejecutar)

| Repo | Copilot tip | Agenda tip |
|------|-------------|------------|
| Frontend | `origin/release/medical-copilot-v1.0-rc2` | `origin/feature/agenda-enterprise` |
| Backend | `origin/release/medical-copilot-v1.0-rc2` | `origin/feature/agenda-enterprise` |

Al inicio de la ejecución:

```bash
git fetch origin release/medical-copilot-v1.0-rc2 feature/agenda-enterprise
git merge-tree --write-tree origin/release/medical-copilot-v1.0-rc2 origin/feature/agenda-enterprise
# Debe imprimir un tree SHA sin conflictos. Si falla → ABORT.
```

---

## Política Git

| Permitido | Prohibido |
|-----------|-----------|
| `merge --no-ff` | rebase / squash de RC o fases |
| push de merge commit | force-push |
| tags anotados post-merge | reset --hard en ramas compartidas |
| `merge --abort` / `revert -m 1` | reescribir historial |

---

# FASE 1 — Merge Backend

**Dirección:** `feature/agenda-enterprise` → `release/medical-copilot-v1.0-rc2`

### Procedimiento

```bash
cd <backend-repo-root>   # monorepo que contiene heydoctor-backend-pro/
git fetch origin
git checkout release/medical-copilot-v1.0-rc2
git pull --ff-only origin release/medical-copilot-v1.0-rc2
git status                 # working tree limpio

git merge --no-ff origin/feature/agenda-enterprise \
  -m "$(cat <<'EOF'
merge(agenda): integrate Agenda Enterprise into Medical Copilot RC2

Unified backend tip for Copilot RC3–RC6 + Agenda F1–F10 SSOT. No deploy.
EOF
)"
```

### Verificaciones post-merge (Backend)

```bash
cd heydoctor-backend-pro   # si aplica
npm run format:check
npm run lint:ci            # 0 errors
npm run build
npx jest --forceExit       # suites PASS
```

Checklist:

- [ ] Merge commit creado (`--no-ff`)  
- [ ] Commits Agenda + Copilot presentes en tip (`git log --oneline --graph -20`)  
- [ ] Migraciones unidas: `175130` + `175260`–`175290`  
- [ ] Gates PASS  

### Commit esperado

Un merge commit en `release/medical-copilot-v1.0-rc2` con dos parents (RC2 tip + Agenda tip).

### Push (solo tras gates)

```bash
git push origin release/medical-copilot-v1.0-rc2
```

### Rollback Fase 1

| Momento | Acción |
|---------|--------|
| Antes de push | `git merge --abort` o reset al tip previo **local** |
| Después de push | `git revert -m 1 <merge_sha>` + push (no force) |

---

# FASE 2 — Merge Frontend

**Dirección:** `feature/agenda-enterprise` → `release/medical-copilot-v1.0-rc2`  
**Solo si Fase 1 Backend está pusheada y verde.**

### Procedimiento

```bash
cd <frontend-repo>
git fetch origin
git checkout release/medical-copilot-v1.0-rc2
git pull --ff-only origin release/medical-copilot-v1.0-rc2
git status

git merge --no-ff origin/feature/agenda-enterprise \
  -m "$(cat <<'EOF'
merge(agenda): integrate Agenda Enterprise into Medical Copilot RC2

Unified frontend tip for Copilot RC3–RC6 UI + Agenda F1–F10 workspace. No deploy.
EOF
)"
```

### Verificaciones

```bash
npm run lint               # tsc --noEmit
npm test
NEXT_PUBLIC_API_URL=<staging-api> NEXT_PUBLIC_WS_URL=<staging-ws> npm run build
```

Checklist:

- [ ] Merge commit `--no-ff`  
- [ ] `/panel/agenda` y `/panel/consultas/[id]/medical-copilot` en árbol  
- [ ] Gates PASS  

### Push

```bash
git push origin release/medical-copilot-v1.0-rc2
```

### Rollback Fase 2

Igual que Fase 1: `merge --abort` o `revert -m 1`.

---

# FASE 3 — QA integrada

Ver: `docs/enterprise-smoke-test-checklist.md` + `docs/enterprise-post-merge-validation.md`.

Mínimo:

1. Medical Copilot: kill switch, ownership, shell activo.  
2. Agenda: dashboard, availability, blocks, waitlist, reminders, timezone.  
3. Auth: JWT login, CSRF mutation, clinic/doctor scope.  
4. Playwright RC2 **si** `.env.e2e` staging disponible.

**STOP** si P0 falla → no continuar a Fase 4.

---

# FASE 4 — Merge Release → main

**Solo con autorización adicional de promoción a main.**

Backend y Frontend por separado:

```bash
git checkout main
git pull --ff-only origin main
git merge --no-ff origin/release/medical-copilot-v1.0-rc2 \
  -m "merge(release): promote unified Copilot+Agenda RC2 to main"
# gates
git push origin main
```

Orden: **Backend main → Frontend main**.

Rollback: `revert -m 1` en `main` (no force-push).

---

# FASE 5 — Railway (Backend)

Ver: `docs/enterprise-production-promotion-runbook.md` § Railway.

1. Deploy backend desde tip autorizado.  
2. Migraciones (orden 175130 → 175290).  
3. Health / ops.  
4. Smoke API Agenda + Copilot.  
5. Rollback = redeploy previous Railway deployment.

---

# FASE 6 — Vercel Preview (Frontend)

1. Preview deployment del tip unificado.  
2. `NEXT_PUBLIC_API_URL` → API staging/prod según política.  
3. Smoke UI + flags (`NEXT_PUBLIC_MEDICAL_COPILOT`).  
4. QA checklist.  
5. **No** promover Production hasta Fase 7 autorizada.

---

# FASE 7 — Production

1. Backend Railway prod (si no hecho en 5 con target prod).  
2. Frontend Vercel Production.  
3. Smoke + health + monitoring.  
4. Rollback dual documentado.

---

# FASE 8 — Post Go-Live

Ver: `docs/enterprise-post-deploy-validation.md` + checklist JSON.

Monitorear 24–72h: logs, health, JWT/RBAC/CSRF, Copilot, Agenda (waitlist/reminders/timezone/dashboard).

---

## Contactos / ownership

| Área | Boundary |
|------|----------|
| Merge Backend/Frontend | Release owner |
| Copilot incident | Kill switch FE; no mezclar con hotfixes Agenda |
| Agenda incident | SSOT appointments; no tocar AI |

---

## Registro de ejecución (rellenar al autorizar)

| Campo | Valor |
|-------|-------|
| Autorizado por | |
| Fecha/hora inicio | |
| Operador | |
| BE merge SHA | |
| FE merge SHA | |
| Resultado | PENDING / PASS / ABORT |
