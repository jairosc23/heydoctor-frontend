# Sprint 1A.1 — Diagnosis Persistence Fix — QA Report

| Campo | Valor |
|-------|--------|
| Repositorio | `jairosc23/heydoctor-frontend` |
| Rama | `feat/sprint-1a1-diagnosis-persistence-fix` |
| Commit | `ba1b6814` |
| Fecha | 2026-06-06 |
| Alcance | Cierre riesgo AUTOSAVE ↔ CIE10 FK |

---

## 1. CI / build

| Comando | Resultado | Detalle |
|---------|-----------|---------|
| `npm run typecheck` | ✅ PASS | Sin errores TS |
| `npm run test` | ✅ PASS | **75/75** (incl. 13 en `consultation-diagnosis.test.ts`) |
| `npm run build` | ✅ PASS | Next.js 16 — build producción OK |

---

## 2. QA manual — matriz de escenarios

### A. Consulta nueva — I10 → select → reload → FK + badge structured

| Paso | Verificación | Resultado |
|------|--------------|-----------|
| Buscar I10 en picker | `SmartDiagnosisPicker` → `GET /search?type=diagnostic` | ⚠️ Browser pendiente preview* |
| Seleccionar | `structuredDiagnosisFromPicker` + `persistSoapDraft(nextState)` | ✅ Lógica |
| PATCH payload | `buildSoapPatch` incluye `diagnosis` + `cie10CodeId` | ✅ Test `buildSoapPatch consistency` |
| Reload hydrate | `hydrateDiagnosisFromConsultation` → `source: structured` | ✅ Test `picker → confirm → reload` |
| Badge | `getDiagnosisBadgeVariant('structured')` → índigo, sin warning | ✅ Test `DiagnosisBadge structured vs parsed` |

\* Preview Vercel + backend con catálogo CIE-10 desplegado requerido para click-through en navegador.

---

### B. Consulta existente — E11.9 → notas → autosave → reload → FK intacta

| Paso | Verificación | Resultado |
|------|--------------|-----------|
| Confirm E11.9 | Mismo `buildSoapPatch` que autosave | ✅ Test `confirm and autosave produce identical diagnosis payload` |
| Editar notas | `soapDraftKey` incluye `cie10CodeId` | ✅ Test `buildSoapDraftKey includes cie10CodeId` |
| Autosave debounce | `useConsultationAutosave` → `persistSoapDraft()` | ✅ Código unificado en `page.tsx` |
| PATCH sin borrar FK | Backend PATCH parcial + `cie10CodeId` explícito en payload | ✅ Test `picker → autosave → reload` |
| Reload | FK + `source: structured` preservados | ✅ |

---

### C. Consulta legacy — `"R51 - Cefalea"` sin `cie10CodeId`

| Paso | Verificación | Resultado |
|------|--------------|-----------|
| GET sin FK | `hydrateDiagnosisFromConsultation({ diagnosis, cie10CodeId: null })` | ✅ |
| `source` | `'parsed'` | ✅ Test `hydrates parsed diagnosis when text looks structured but FK is missing` |
| Badge variant | `'parsed'` — fondo ámbar | ✅ Componente `DiagnosisBadge` |
| Warning | `shouldShowUnlinkedWarning('parsed', 'R51') === true` | ✅ |
| Texto UI | `"Sin código CIE-10 vinculado — selecciona de nuevo..."` | ✅ `data-testid="diagnosis-badge-unlinked-warning"` |

---

### D. Error de red — fallo PATCH → rollback visual

| Paso | Verificación | Resultado |
|------|--------------|-----------|
| Confirm falla | `catch` en `handleDiagnosisConfirm` | ✅ Código |
| Rollback estado | `setDiagnosisState(hydrateDiagnosisFromConsultation(consultation))` | ✅ Test `confirm fail rollback` |
| Error visible | `diagnosisError` → alert rojo en `SoapSection` | ✅ Código |
| No orphan FK en UI | Estado revertido al último `consultation` conocido | ✅ Test |

---

## 3. Veredicto QA

| Capa | Estado |
|------|--------|
| CI (typecheck / test / build) | 🟢 VERDE |
| Lógica persistencia (unit tests A–D) | 🟢 VERDE |
| Browser E2E en preview | 🟡 PENDIENTE — requiere PR preview + API con `/search` y `cie10CodeId` |

### Decisión

**QA técnico VERDE** — todos los escenarios A–D están cubiertos por tests automatizados y revisión de código.  
**Merge aprobado** condicionado a:

1. Abrir PR desde rama `feat/sprint-1a1-diagnosis-persistence-fix`.
2. CI del PR en verde.
3. Smoke browser opcional en preview Vercel antes de deploy producción.

**No desplegar a producción** hasta validar preview con backend Sprint 1A.1 (catálogo CIE-10 + PATCH FK).

---

## 4. Git / PR

| Acción | Estado |
|--------|--------|
| Commit local | ✅ `ba1b6814` |
| Push rama feature | ✅ `origin/feat/sprint-1a1-diagnosis-persistence-fix` |
| PR GitHub | ⚠️ `gh auth login` requerido — crear en: https://github.com/jairosc23/heydoctor-frontend/pull/new/feat/sprint-1a1-diagnosis-persistence-fix |
| Merge approval | ✅ Aprobado técnicamente (QA verde) |

---

## 5. Archivos en el fix

- `lib/services/consultation-diagnosis.ts`
- `lib/services/consultation-diagnosis.test.ts`
- `lib/services/diagnosis.ts`
- `lib/services/index.ts`
- `lib/services/consultations.ts` / `.test.ts`
- `lib/services/search.ts`
- `lib/services/diagnosis.test.ts`
- `app/panel/consultas/[id]/page.tsx`
- `app/panel/consultas/[id]/_components/SoapSection.tsx`
- `components/clinical/DiagnosisBadge.tsx`
- `components/clinical/SmartDiagnosisPicker.tsx`
- `components/clinical/index.ts`

---

## 6. Checklist post-merge (no prod aún)

- [ ] Preview Vercel — escenario A click-through
- [ ] Preview — escenario B con autosave visible (indicador)
- [ ] Preview — escenario C con consulta legacy seed
- [ ] Preview — escenario D (DevTools → offline al confirmar)
- [ ] Deploy producción solo tras backend CIE-10 en Railway
