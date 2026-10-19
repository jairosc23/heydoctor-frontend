# PQ-02 — Frontend Component Testing Foundation

**Épica:** EPIC 1D  
**Iniciativa:** PQ-02 (autorizada como Component Testing Foundation)  
**Fecha:** 2026-07-17  
**Repo:** `jairosc23/heydoctor-frontend`  
**Rama:** `feature/v1.1-platform-evolution`  
**Dependencias:** PQ-01, PQ-09  
**Modo:** Solo infra de component testing + suite mínima representativa. Sin negocio clínico.

---

## 1. Archivos creados / modificados

### Creados

| Path | Rol |
|------|-----|
| `vitest.config.ts` | Runner Vitest + jsdom + alias `@/` |
| `test/setup.ts` | jest-dom + cleanup |
| `test/utils/render.tsx` | `renderWithProviders` + user-event |
| `test/mocks/next-link.tsx` | Stub de `next/link` |
| `test/components/ui/Button.test.tsx` | Pruebas Button |
| `test/components/ui/Input.test.tsx` | Pruebas Input |
| `test/components/ui/Card.test.tsx` | Pruebas Card |
| `docs/pq-02-component-testing.md` | Este informe |
| `docs/pq-02-component-testing.json` | Evidencia |

### Modificados

| Path | Cambio |
|------|--------|
| `package.json` | deps Vitest/RTL + scripts `test:component` |
| `package-lock.json` | lockfile |
| `.github/workflows/ci.yml` | L1 step `Component tests (PQ-02)` |

---

## 2. Cambios realizados

1. Introducido **Vitest + React Testing Library + jsdom + user-event**.  
2. Separado del runner existente `node:test` (`npm test` en `lib/**`).  
3. Helpers compartidos (`renderWithProviders`, mock Link).  
4. Suite mínima sobre primitives `components/ui/*`.  
5. Integrado en job CI `quality` (Nivel 1 PQ-09).

---

## 3. Arquitectura propuesta

```text
npm test                 → lib unit (node:test)     [existente]
npm run test:component   → React components (Vitest) [PQ-02]
npm run test:e2e:p0      → Playwright P0             [PQ-01]
```

### Convenciones

| Tema | Convención |
|------|------------|
| Ubicación specs | `test/components/**/*.test.tsx` |
| Helper de render | `import { renderWithProviders } from "@/test/utils/render"` |
| Mocks Next | `test/mocks/*` + `vi.mock` en el spec |
| Providers | `AllProviders` delgado; ampliar solo con deps transversales reales |
| Fuera de alcance inicial | `medical-copilot/`, `agenda/`, encounter clínico |
| Naming | describe = nombre del componente + “(ui primitive)” |

### Pirámide

```text
        E2E (Playwright P0)
       /                    \
  Component (Vitest/RTL)     API E2E (BE)
       \                    /
         Unit lib (node:test)
```

---

## 4. Componentes cubiertos

| Componente | Archivo | Casos |
|------------|---------|-------|
| `Button` | `components/ui/Button.tsx` | role button, disabled, link via href |
| `Input` | `components/ui/Input.tsx` | type value, disabled |
| `Card` | `components/ui/Card.tsx` | children / heading |

**6 tests** en **3 archivos**. Sin tocar Copilot/Agenda/clínico.

---

## 5. Validaciones ejecutadas

| Check | Resultado |
|-------|-----------|
| `npm run test:component` | **PASS** — 3 files, 6 tests |
| `npm test` (lib unit) | Ejecutado en validación local (sin regresión esperada) |
| Integración CI L1 | Step añadido en `quality` |
| Preview/E2E | No requerido para PQ-02 |

---

## 6. Limitaciones y próximos pasos

### Limitaciones

- Sin cobertura de componentes con Auth/React Query/Sentry reales.  
- `next/link` stubeado (suficiente para primitives).  
- No hay coverage threshold de componentes aún.  
- ErrorBoundary / layouts con side-effects quedan para fases posteriores.

### Próximos pasos (requieren auth)

1. Ampliar a `CookieBanner`, `WhatsappIcon`, branding no clínico.  
2. Provider opcional React Query para shells no clínicos.  
3. Threshold de coverage solo sobre `components/ui`.  
4. **No** migrar masivamente Copilot/Agenda sin épica dedicada.

---

## 7. Riesgos remanentes

| ID | Riesgo | Severidad |
|----|--------|-----------|
| R1 | Confundir `npm test` vs `test:component` | Baja — docs/scripts separados |
| R2 | Scope creep a módulos clínicos | Media — convención de exclusión |
| R3 | Flakes jsdom en componentes con timers | Baja en primitives actuales |
| R4 | Coste CI (+Vitest ~segundos) | Baja |

---

## 8. GO / NO GO — ampliar Component Testing

### **GO CONDICIONAL**

**GO** para ampliar gradualmente a más **primitives / UI reutilizable no clínica**.

**NO GO** para migración masiva de Medical Copilot / Agenda / encounter sin autorización y sin providers adecuados.

---

## 9. Certificación PQ-02

| Criterio | Resultado |
|----------|-----------|
| Infra reproducible | **PASS** |
| Ejecución local | **PASS** |
| Integración pipeline L1 | **PASS** |
| Helpers comunes | **PASS** |
| Cobertura inicial reutilizable | **PASS** |
| Sin negocio clínico | **PASS** |

### **PASS — PQ-02 Frontend Component Testing Foundation**

**STOP.** Esperar autorización explícita para la siguiente iniciativa Platform Quality.
