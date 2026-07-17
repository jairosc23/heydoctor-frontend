# HeyDoctor Enterprise — Rollback Runbook

> Usar ante fallo P0 en merge, QA, deploy o go-live.  
> **Nunca** `push --force` a `main` o `release/medical-copilot-v1.0-rc2` salvo orden explícita de emergencia documentada.

---

## Principios

1. Preferir **revert** sobre rewrite.  
2. Rollback FE y BE pueden ser independientes.  
3. Kill switch Copilot aísla AI UI sin tocar Agenda/auth.  
4. Migraciones Agenda/Copilot son **aditivas** — no bajar columnas sin DBA.  
5. Mantener tips de `feature/agenda-enterprise` y freeze tags como referencia.

---

## A) Rollback de merge (pre-deploy)

### Antes de push

```bash
git merge --abort
# o, si el merge ya commitió localmente:
git reset --hard ORIG_HEAD   # solo local, nunca si ya se pusheó
```

### Después de push del merge

```bash
git checkout release/medical-copilot-v1.0-rc2   # o main
git pull --ff-only
git revert -m 1 <MERGE_COMMIT_SHA>
# gates
git push origin HEAD
```

`-m 1` = conservar el parent de la rama destino (RC2/main).

### Verificar

- [ ] Tip ya no contiene cambios Agenda (o viceversa según revert)  
- [ ] Gates PASS  
- [ ] Comunicar abort  

---

## B) Rollback Frontend (Vercel)

| Escenario | Acción |
|-----------|--------|
| Preview roto | No promover; redeploy commit previo en Preview |
| Production roto | Instant Rollback / redeploy deployment anterior en Vercel |
| Solo Copilot UI | `NEXT_PUBLIC_MEDICAL_COPILOT=0` o kill switch localStorage |
| Solo Agenda UI | Redeploy FE previo (Agenda sin flag) |

---

## C) Rollback Backend (Railway)

| Escenario | Acción |
|-----------|--------|
| Crash / health fail | Redeploy deployment anterior |
| Regresión API Agenda | Redeploy previo; FE puede seguir si contrato compatible |
| Regresión Copilot session | Redeploy previo; kill switch FE mientras tanto |
| Migración fallida mid-deploy | No continuar FE promote; fix forward o restore DB snapshot |

**No** ejecutar `DROP COLUMN` / down migrations sin plan.

---

## D) Rollback parcial por producto

| Producto | Mitigación rápida |
|----------|-------------------|
| Medical Copilot | Kill switch + opcional env FE off |
| Agenda Enterprise | Rollback FE; BE SSOT intacto si solo UI |
| Auth/CSRF | Rollback BE+FE juntos (compartido) |

---

## E) Matriz de decisión

| Síntoma | Primero | Luego |
|---------|---------|-------|
| Merge conflict inesperado | abort | reabrir merge readiness |
| Tests rojos post-merge | no push / revert | investigar |
| Preview UI Agenda rota | rollback FE | mantener BE |
| Preview Copilot rota | kill switch | rollback FE si persiste |
| API 5xx post-Railway | rollback BE | no promote FE |
| Prod P0 ambos | rollback FE + BE | postmortem |

---

## F) Post-rollback

1. Ticket con SHA bueno / SHA malo.  
2. No reintentar merge/deploy en la misma ventana sin root cause.  
3. Actualizar checklist go-live a NO GO.  
4. Preservar ramas origen intactas.
