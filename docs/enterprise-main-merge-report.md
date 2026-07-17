# HeyDoctor Enterprise — Main Merge Report (Fase 5)

> Fecha: 2026-07-16  
> Origen: `release/medical-copilot-v1.0-rc2` → Destino: `main`  
> **Deploy: NO ejecutado**

---

## Resultado: BLOQUEADO (push a `main` rechazado)

La preparación técnica y los gates locales PASS, pero **GitHub Branch Protection** impide actualizar `main` porque la historia de release contiene **merge commits**.

| Repo | Error remoto |
|------|----------------|
| Backend | `GH006: Protected branch update failed` — *This branch must not contain merge commits* · violación `0112945` |
| Frontend | `GH006` idéntico · violación `61c78131` |

Ambos commits son los merges unificados Agenda → RC2 (Fases 1–2), **requeridos** por la estrategia certificada `--no-ff`.

---

## Lo ejecutado

### Backend

| Paso | Resultado |
|------|-----------|
| fetch / checkout `main` / pull | OK |
| `merge --no-ff` RC2 | OK local → `052ad6e` |
| Gates format/lint/build/tests | **PASS** (922 tests) |
| `push origin main` (`--no-ff`) | **REJECTED** GH006 |
| Reintento `merge --ff-only` (tip = RC `b7aa0ba`) | Local OK; **push REJECTED** (historia aún incluye `0112945`) |
| Estado final local `main` | Reseteado a `origin/main` (`356e97f`) |

### Frontend

| Paso | Resultado |
|------|-----------|
| `merge --ff-only` RC2 local | Tip `6883691a` |
| `push origin main` | **REJECTED** GH006 (`61c78131`) |
| Estado final local `main` | Reseteado a `origin/main` (`82de5585`) |

---

## Gates (sobre tip unificado / main local pre-reset)

| Gate | Backend | Frontend |
|------|---------|----------|
| format / lint | PASS (0 errors) | — |
| tsc / lint | — | No re-ejecutado post-bloqueo* |
| build | PASS | — |
| tests | PASS 264/922 | — |

\* FE gates ya PASS en Fase 3/4 sobre el mismo tip RC2; el bloqueo ocurrió en push antes de repetir el ciclo completo FE en `main`.

---

## Confirmación de contenido en release (intacta)

`release/medical-copilot-v1.0-rc2` **no se modificó** y sigue conteniendo:

- Medical Copilot RC3–RC6  
- Agenda Enterprise F1–F10  
- Merges unificados F1/F2  

`main` remoto **no** recibió la release.

---

## Causa raíz

Política GitHub en `main`: **prohibidos merge commits en el historial que se introduce**.  
La release usa merges `--no-ff` (Agenda→RC2), incompatibles con esa regla.

### Opciones para desbloquear (requieren autorización explícita)

| Opción | Descripción |
|--------|-------------|
| A | Relajar branch protection en `main` (permitir merge commits) y reintentar `--no-ff` o FF |
| B | Crear tip lineal (rebase/squash controlado de RC2 sobre `main`) y push FF — **cambia historial** |
| C | PR a `main` vía UI/GitHub con excepción admin |

**No se ejecutó** rebase, squash, force-push ni cambio de protection.

---

## Hashes relevantes

| Ítem | SHA |
|------|-----|
| BE merge `--no-ff` local (no pusheado) | `052ad6e7b306014a206e3d822cbda52859ace417` |
| BE RC2 tip / FF tip | `b7aa0ba42aa55ffc79c4dc87fa0fd15b32d670c7` |
| FE RC2 tip | `6883691a…` |
| BE `origin/main` (sin cambios) | `356e97f` |
| FE `origin/main` (sin cambios) | `82de5585` |
| Merge commit bloqueante BE | `0112945` |
| Merge commit bloqueante FE | `61c78131` |

---

## Certificación Fase 5

| Criterio | Estado |
|----------|--------|
| Intento merge controlado | ✔ ejecutado |
| Push a `main` | ✖ bloqueado por protection |
| Deploy | No ejecutado (correcto) |
| Release intacta | ✔ |

**Fase 5: NO CERTIFICADA como merge completado.**  
**Estado: BLOCKED — awaiting policy decision (A/B/C).**

Detenerse. Esperar autorización para desbloqueo o Fase 6.
