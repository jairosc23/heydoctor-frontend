# HeyDoctor Enterprise — Post-Merge Validation

> Ejecutar **inmediatamente después** de Fases 1–2 (merge AG→RC2 en BE y FE), **antes** de merge a `main` o deploy.

---

## 1. Integridad Git

```bash
# Backend
git checkout release/medical-copilot-v1.0-rc2
git pull --ff-only
git log --oneline --merges -3
git merge-base --is-ancestor origin/feature/agenda-enterprise HEAD && echo AG_in_tip=yes
# Verificar que commits RC3–RC6 siguen alcanzables
git log --oneline --grep='RC3\|RC4\|RC5\|RC6\|agenda\|Phase' -30

# Frontend (igual)
```

Checklist:

- [ ] Merge commits `--no-ff` presentes en BE y FE  
- [ ] Tip contiene Agenda F1–F10 **y** Copilot RC3–RC6  
- [ ] No force-push ocurrió  
- [ ] `feature/agenda-enterprise` tip aún existe como referencia  

---

## 2. Gates locales (tip unificado)

### Backend

```bash
npm run format:check
npm run lint:ci          # 0 errors
npm run build
npx jest --forceExit
```

### Frontend

```bash
npm run lint
npm test
NEXT_PUBLIC_API_URL=... NEXT_PUBLIC_WS_URL=... npm run build
```

- [ ] BE PASS  
- [ ] FE PASS  

---

## 3. Inventario funcional en árbol

| Superficie | Presente |
|------------|----------|
| `heydoctor-backend-pro/src/ai/**` (o path AI) | [ ] |
| `appointments` + `appointments-enterprise` + clinic timezone | [ ] |
| Migraciones 175130 + 175260–175290 | [ ] |
| FE `app/panel/agenda` | [ ] |
| FE `app/panel/consultas/[id]/medical-copilot` | [ ] |
| Docs enterprise runbooks | [ ] |

---

## 4. Smoke (staging o local+API)

Ejecutar `docs/enterprise-smoke-test-checklist.md`.

- [ ] Auth PASS  
- [ ] Copilot PASS  
- [ ] Agenda PASS  
- [ ] Playwright RC2 (si entorno listo)  

---

## 5. Decisión post-merge

| Resultado | Siguiente paso |
|-----------|----------------|
| PASS | Autorizar Fase 4 (main) y/o deploy según política |
| FAIL P0 | `enterprise-rollback-runbook.md` § A |
| FAIL P1 | Waiver documentado o fix-forward en RC2 unificada |

**No deploy automático** desde esta validación.
