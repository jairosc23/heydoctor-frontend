# CX-01 — Clinical Experience Sprint 1

**ID:** `CX-01-CLINICAL-EXPERIENCE-SPRINT-1`  
**Tipo:** Estándar de UX clínica + diseño e implementación del sprint  
**Producto:** HeyDoctor Clinical Encounter™  
**STATUS:** COMPLETED  
**Fecha de cierre:** 2026-07-21  
**Clinical Acceptance final:** PASS (PR-1, PR-2, PR-3)

### Cierre de implementación

| Campo | Valor |
|-------|--------|
| SHA final `main` (código CX-01 I0–I7) | `2133fa84b05e7d0f223b8c43215db79d36e7f60e` |
| SHA desplegado Vercel Production | `2133fa84b05e7d0f223b8c43215db79d36e7f60e` (`2133fa8`) |
| Deploy Production | `dpl_5E7gYz6YR4LL36yj4wJkFy9fCiem` · Ready · alias `app.heydoctor.health` |
| Backend Production (sin redeploy) | `e5364190ebeac61f94181c4a9bfb692962e4401c` |

### Resumen ejecutivo de mejoras

| Iniciativa | Mejora |
|------------|--------|
| I0 | Estándar UX clínica documentado y aprobado |
| I1 | Modo edición visible (badge + CTA fuera del menú `⋯`) |
| I2 | Antecedentes editables a la vista, sin accordion crítico |
| I3 | Guardar con alcance y feedback clínico |
| I4 | Pendientes de documentación con estados de sincronización |
| I5 | Lenguaje clínico en navegación e identificación |
| I6 | Hint de talla (cm/m; confirma al salir del campo) |
| I7 | Viewport del Navigation Rail para alcanzar el último ítem |

### Resultado Clinical Acceptance

- PR-1 (I0–I3): PASS  
- PR-2 (I4–I5): PASS  
- PR-3 (I6–I7): PASS  
- CX-01 Clinical Acceptance Final: **PASS**  
- EPIC-3 permanece congelado; Backend sin cambios en CX-01.

### Baseline de entrada (pre-CX-01)

| Capa | Valor |
|------|--------|
| EPIC-3 Engineering | COMPLETED (congelado) |
| Backend `main` / prod | `e5364190ebeac61f94181c4a9bfb692962e4401c` |
| Frontend `main` al inicio | `3efaad0224f4ff01aaf3588548bc5d46ef0a91db` |
| Producción al inicio | Railway (BE) + Vercel (FE) |

### Fuera de alcance absoluto

- Arquitectura clínica, Clinical Foundation, IA, Daily Hub, Clinical Memory, Timeline, WebRTC  
- Backend (objetivo: **cero** cambios; solo si un bloqueo UX absoluto lo demuestra en diseño — no aplica a este sprint)  
- Backlog post-acceptance: lumbar/MSK (H5), recetas avanzadas (H6), workspace intermedio (H7), consent paciente (H8)  
- EPIC-4  

---

## 1. Clinical Design Principles

Estos principios son **normativos** para toda UI clínica de HeyDoctor a partir de CX-01.

| # | Principio | Implicación operativa |
|---|-----------|------------------------|
| P1 | **Todo campo editable debe verse editable** | Inputs/textareas visibles; no parecer texto estático o tarjeta informativa. |
| P2 | **Nunca ocultar información crítica detrás de accordions o `<details>`** | Alergias, antecedentes, medicamentos habituales y familiares permanecen a la vista en modo edición. |
| P3 | **Nunca utilizar terminología técnica para médicos** | Prohibido en UI: SoT, Foundation, draft, details, §N, etc. (ver §2). |
| P4 | **Un Guardar = un feedback claro** | Tras confirmar, el médico sabe *qué* se guardó y *si* tuvo éxito. |
| P5 | **Todo dato persistido debe verse inmediatamente** | Tras guardar/recargar, la UI refleja el valor persistido sin pasos ocultos. |
| P6 | **Ningún flujo clínico debe requerir entrenamiento** | Descubrible en ≤ 30 s por un médico nuevo en el producto. |
| P7 | **Máximo dos clics para editar información clínica relevante** | Contar desde “estoy en la ficha de la consulta” hasta “estoy tipando en el campo”. |

### Prueba de oro (Acceptance UX)

> Un médico completa el flujo sin que nadie le explique dónde editar, cómo guardar ni por qué los avisos de documentación cambian.

---

## 2. Clinical Language System

### 2.1 Términos prohibidos en UI orientada al médico

| Prohibido | Motivo |
|-----------|--------|
| Source of Truth / SoT | Jerga de ingeniería |
| Foundation / Clinical Foundation | Concepto de plataforma |
| draft / Draft | Ambiguo clínicamente |
| details / accordion (como label) | Implementación |
| §4, §8, §4–§8 | Numeración interna de producto |
| upsert / patch / reload | API |
| fingerprint / dirty key | Interno |
| HD_VS_V1 / HD_PE_V1 | Marcadores técnicos |
| UC-03B / EPIC-3 | Códigos de programa |

*Notas para desarrolladores en código/comentarios/tests siguen permitidas; **no** en copy visible al médico.*

### 2.2 Diccionario clínico (reemplazos)

| Concepto interno | Lenguaje clínico en UI |
|------------------|-------------------------|
| editMode = true | **Editando la consulta** |
| editMode = false | **Solo lectura** |
| antecedents draft dirty | **Hay cambios sin guardar en antecedentes** |
| upsert patient profile | **Guardar en la ficha del paciente** |
| flush / persist | **Guardar** |
| autosave | **Guardado automático** |
| manual save | **Guardar** |
| Documentation Gaps | **Pendientes de documentación** (subtítulo: oportunidades de completitud) |
| Foundation reload | **Actualizando pendientes…** |
| gaps from last persist | **Según la última versión guardada** |
| longitudinal §4–§8 | **Antecedentes del paciente** |
| chronicConditions | **Antecedentes personales** |
| medications (profile) | **Medicamentos habituales** |
| allergies | **Alergias** |
| familyHistory | **Antecedentes familiares** |
| smoking/alcohol/… | **Hábitos** |
| convert m→cm on blur | *(hint)* **Puede indicar cm o metros; se confirma al salir del campo** |
| Clinical Navigation Rail | **Navegación de la ficha** |
| Smart Clinical Workspace / paneles | No renombrar en CX-01 (fuera de alcance H7) |

### 2.3 Tono

- Español clínico claro, segunda persona implícita (“Guarde…”, “Complete…”).  
- Errores: qué falló + qué hacer (“No se pudieron guardar los antecedentes. Intente Guardar de nuevo.”).  
- Éxitos: concreto (“Antecedentes del paciente actualizados.”).

---

## 3. Clinical Interaction Guidelines

### 3.1 Edición

| Regla | Estándar |
|-------|----------|
| Entrada | Control visible **Editar consulta** / estado **Editando la consulta** (no solo menú `⋯`). |
| Campos | Contorno/fondo de input; placeholder clínico; nunca solo texto plano para datos editables. |
| Lectura | Si la consulta no admite edición (firmada/bloqueada): mensaje en sección, sin inputs falsos. |
| Clics | ≤ 2 desde ficha abierta hasta foco en campo relevante (P7). |

### 3.2 Guardado

| Regla | Estándar |
|-------|----------|
| Acción primaria | Botón **Guardar** en el header de la ficha. |
| Alcance | Si hay cambios de antecedentes pendientes, el label o badge lo indica (p. ej. **Guardar consulta y antecedentes**). |
| Post-éxito | Feedback único: consulta guardada +, si aplica, antecedentes de la ficha del paciente. |
| Post-error | Badge/alert visible; no silenciar en consola. |

### 3.3 Dirty state

| Regla | Estándar |
|-------|----------|
| Señal | Texto o badge **Cambios sin guardar** cerca del Guardar y/o en la sección afectada. |
| Persistencia visual | No enterrar el dirty state dentro de un bloque colapsado. |
| Salida | No se exige modal en CX-01; se recomienda dirty visible antes de navegar (mejora opcional Fase 3). |

### 3.4 Autosave

| Regla | Estándar |
|-------|----------|
| Label | **Guardado automático** / **Guardando…** / **Guardado hace X s**. |
| Relación con Guardar | Una línea de ayuda: el guardado automático incluye la consulta; si hay cambios en antecedentes, **Guardar** (o el autosave ya cableado) debe dejar feedback de ficha del paciente. |
| No sustituye | El feedback explícito post-acción manual cuando el médico pulsa Guardar. |

### 3.5 Navegación

| Regla | Estándar |
|-------|----------|
| Rail | Etiquetas clínicas; último ítem alcanzable por scroll. |
| Secciones | IDs/anclas estables; no renombrar rutas. |
| Link a ficha paciente | Secundario: **Datos demográficos del paciente** (no competir con edición de antecedentes en consulta). |

### 3.6 Feedback

| Estado | UI |
|--------|-----|
| Idle editable | Badge **Editando la consulta** |
| Dirty | Ámbar: **Cambios sin guardar** |
| Saving | **Guardando…** |
| Saved | Verde breve: **Guardado** (+ detalle si hubo antecedentes) |
| Error | Rojo: mensaje accionable |

### 3.7 Loading

- Secciones: “Cargando antecedentes…” / skeleton mínimo.  
- Gaps: “Actualizando pendientes de documentación…”.  
- No bloquear toda la ficha salvo operación global.

### 3.8 Errores

- Distinguir: red / permisos / validación.  
- Reintento = volver a **Guardar**.  
- No usar códigos HTTP en copy.

### 3.9 Sincronización (Pendientes de documentación)

| Situación | Mensaje |
|-----------|---------|
| Draft local sin guardar | **Hay cambios sin guardar. Los pendientes se actualizan al guardar.** |
| Reload en curso | **Actualizando pendientes…** |
| Synced | **Según la última versión guardada.** |
| Lista vacía | **No hay pendientes de documentación con los datos guardados.** |
| Ías reales | Seguir mostrando ítems; tono informativo, no de fallo de sistema. |

---

## 4. Iniciativas del sprint

| ID | Nombre | Prioridad |
|----|--------|-----------|
| **I0** | Clinical Design System (principios + lenguaje + guidelines) | P0 (fundacional — este documento) |
| **I1** | Visible Edit Mode | P0 |
| **I2** | Editable Antecedents | P0 |
| **I3** | Save Experience | P0 |
| **I4** | Documentation Gaps UX | P1 |
| **I5** | Clinical Navigation Language | P1 |
| **I6** | Vital Signs UX | P2 |
| **I7** | Navigation Rail UX | P2 |

---

## 5. Detalle por iniciativa

### I0 — Clinical Design System

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Adoptar este documento como estándar UX clínica HeyDoctor. |
| **Alcance** | Principios §1, lenguaje §2, guidelines §3; checklist de revisión de PRs clínicos. |
| **Archivos potencialmente afectados** | `docs/architecture/CX-01-Clinical-Experience.md` (este); opcional enlace desde `docs/architecture/frontend-roadmap.md` / branding (solo docs). |
| **Dependencias** | Aprobación del owner clínico / producto. |
| **Riesgos** | Documento ignorado en PRs futuros — mitigar con checklist en review. |
| **Prioridad** | P0 |
| **Criterios de aceptación** | Documento aprobado; equipo FE usa el diccionario en CX-01. |
| **Impacto Clinical Acceptance** | Indirecto: evita regresiones de jerga y patrones anti-descubribilidad. |

---

### I1 — Visible Edit Mode

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Que el médico vea siempre si puede editar, sin abrir el menú `⋯`. |
| **Alcance** | Badge **Editando la consulta** / **Solo lectura**; control **Editar consulta** / **Cerrar edición** junto a **Guardar**. Sin cambiar reglas de `status` ni backend. |
| **Archivos potencialmente afectados** | `app/panel/consultas/[id]/page.tsx`, `EncounterHeader.tsx`, `EncounterActionMenu.tsx`, `ClinicalEncounterChart.tsx`. |
| **Dependencias** | I0 (copy). Estado existente `editMode` / `isEditable`. |
| **Riesgos** | Controles duplicados con el menú — mantener ítem del menú como espejo o deprecar label allí. |
| **Prioridad** | P0 |
| **Criterios de aceptación** | Sin abrir `⋯`, se ve el modo; en solo lectura, CTA o mensaje claro; ≤ 1 clic a “puedo editar” cuando el status lo permite. |
| **Impacto Clinical Acceptance** | Alto — desbloquea descubrimiento de I2/I3/I6. |

---

### I2 — Editable Antecedents

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Antecedentes editables a la vista; máximo 2 clics hasta tipar. |
| **Alcance** | En modo edición: textareas visibles (sin depender de expandir `<details>`). Copy clínico. Dirty state visible. **No** cambiar `upsertPatientProfile` ni shape del perfil. |
| **Archivos potencialmente afectados** | `PatientLongitudinalSections.tsx`, `ClinicalEncounterChart.tsx`, `patient-profile-display.ts` (solo si se toca copy helpers). |
| **Dependencias** | I1; persistencia H1 ya en tip `3efaad02`. |
| **Riesgos** | Ficha más larga — densidad tipográfica; hábitos pueden quedar en resumen. |
| **Prioridad** | P0 |
| **Criterios de aceptación** | En consulta editable + editando: personales, medicamentos, alergias y familiares visibles sin “Ver antecedentes”; 0 jerga técnica; dirty visible. |
| **Impacto Clinical Acceptance** | **Crítico** — hallazgo UX principal. |

---

### I3 — Save Experience

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Un Guardar = feedback claro del alcance (consulta ± antecedentes). |
| **Alcance** | Label/badge en Guardar si hay cambios de antecedentes; mensaje post-save; alinear percepción autosave vs Guardar. Sin nuevos endpoints. |
| **Archivos potencialmente afectados** | `ClinicalEncounterChart.tsx`, `page.tsx` (mensajes), `AutosaveIndicator.tsx` (copy). |
| **Dependencias** | I2 (dirty visible); flush de perfil ya existe. |
| **Riesgos** | Sobre-notificación — un solo banner post-manual-save. |
| **Prioridad** | P0 |
| **Criterios de aceptación** | Con solo cambios de antecedentes, Guardar lo indica; tras éxito, confirmación de ficha del paciente; datos visibles tras F5 (regresión H1). |
| **Impacto Clinical Acceptance** | Alto — evita “pensé que no guardó”. |

---

### I4 — Documentation Gaps UX

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | El médico entiende que los pendientes reflejan lo **guardado**, no un draft invisible. |
| **Alcance** | Copy + estados de sync en el panel de pendientes (drawer). **No** cambiar reglas Foundation/gaps ni Daily Hub architecture. |
| **Archivos potencialmente afectados** | `CopilotDocumentationGaps.tsx`, `ClinicalCopilotDrawer.tsx` (solo presentación/estado UX). |
| **Dependencias** | I3 (momento de sync); reload Foundation ya post-save. |
| **Riesgos** | Confundir gaps legítimos con errores — tono informativo. |
| **Prioridad** | P1 |
| **Criterios de aceptación** | Con dirty: mensaje de “se actualizan al guardar”; durante reload: “Actualizando…”; vacío: copy según §3.9. |
| **Impacto Clinical Acceptance** | Medio-Alto — reduce falsa percepción de H2. |

---

### I5 — Clinical Navigation Language

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Eliminar competencia del link a ficha paciente y numeración interna. |
| **Alcance** | Renombrar link de identificación; títulos de sección/rail con lenguaje clínico; sin cambiar rutas. |
| **Archivos potencialmente afectados** | `PatientIdentificationSection.tsx`, `ClinicalNavigationRail.tsx`, labels en `clinical-navigation-rail-model` / secciones chart. |
| **Dependencias** | I0, I2. |
| **Riesgos** | Bajo. |
| **Prioridad** | P1 |
| **Criterios de aceptación** | Ningún `§N` ni “SoT” en UI; link demográfico es secundario; camino primario de antecedentes = inline. |
| **Impacto Clinical Acceptance** | Medio. |

---

### I6 — Vital Signs UX

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Talla comprensible (cm/m) sin percibir bug en blur. |
| **Alcance** | Microcopy bajo talla; sin cambiar `normalizeClinicalVitalSigns`. |
| **Archivos potencialmente afectados** | `VitalSignsSection.tsx`. |
| **Dependencias** | Fix H3 en tip. |
| **Riesgos** | Ninguno. |
| **Prioridad** | P2 |
| **Criterios de aceptación** | Hint visible; digitación sin salto; conversión solo al salir/guardar (regresión H3). |
| **Impacto Clinical Acceptance** | Bajo-Medio (pulido HIGH previo). |

---

### I7 — Navigation Rail UX

| Campo | Contenido |
|-------|-----------|
| **Objetivo** | Garantizar acceso al último ítem; labels clínicos. |
| **Alcance** | QA en viewports reales; ajuste fino CSS/`max-h` si hace falta; labels vía I5. Sin rediseño del rail. |
| **Archivos potencialmente afectados** | `ClinicalNavigationRail.tsx`, posiblemente `PanelLayout` solo lectura de offsets. |
| **Dependencias** | Fix H4 en tip; I5 para labels. |
| **Riesgos** | Variación zoom/OS. |
| **Prioridad** | P2 |
| **Criterios de aceptación** | Scroll alcanza el último ítem en desktop clínico típico (2 alturas de viewport). |
| **Impacto Clinical Acceptance** | Bajo (cierre residual H4). |

---

## 6. Wireframes conceptuales (ASCII)

### 6.1 Header de ficha (I1 + I3)

```
┌─ Ficha clínica ─────────────────────────────────────────────────────────┐
│  [Editando la consulta]          [Guardar consulta y antecedentes] [·] │
│                                       ↑ badge si hay cambios            │
│  Guardado automático · hace 3 s                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

Solo lectura:

```
┌─ Ficha clínica ─────────────────────────────────────────────────────────┐
│  [Solo lectura]     [Editar consulta] (si status lo permite)   [Guardar]│
│  Esta consulta no admite cambios en el estado actual.                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Antecedentes (I2) — modo edición

```
┌─ Antecedentes del paciente ─────────────────────────────────────────────┐
│  Hay cambios sin guardar en antecedentes                                │
│                                                                         │
│  Antecedentes personales          Medicamentos habituales               │
│  ┌─────────────────────────┐      ┌─────────────────────────┐           │
│  │ (textarea visible)      │      │ (textarea visible)      │           │
│  └─────────────────────────┘      └─────────────────────────┘           │
│  Alergias                         Antecedentes familiares               │
│  ┌─────────────────────────┐      ┌─────────────────────────┐           │
│  │                         │      │                         │           │
│  └─────────────────────────┘      └─────────────────────────┘           │
│  Hábitos (resumen) …                                                    │
│  Una entrada por línea. Se guarda en la ficha del paciente.             │
└─────────────────────────────────────────────────────────────────────────┘
```

**Anti-patrón (prohibido en CX-01):**

```
┌─ §4–§8 longitudinal · editables · SoT perfil  [Ver antecedentes ▸] ─┐
│  (contenido oculto — el médico cree que no se puede editar)           │
└───────────────────────────────────────────────────────────────────────┘
```

### 6.3 Post-Guardar (I3)

```
┌─ Banner ────────────────────────────────────────────────────────────────┐
│  ✓ Consulta guardada · Antecedentes del paciente actualizados           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Pendientes de documentación (I4)

```
┌─ Pendientes de documentación ───────────────────────────────────────────┐
│  Oportunidades de completitud · Según la última versión guardada        │
│                                                                         │
│  (dirty)  Hay cambios sin guardar. Se actualizan al guardar.            │
│  (sync)   Actualizando pendientes…                                      │
│  (ok)     No hay pendientes con los datos guardados.                    │
│  (lista)  · Falta indicación de seguimiento                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.5 Identificación — link secundario (I5)

```
┌─ Identificación ────────────────────────────────────────────────────────┐
│  …datos…                                                                │
│  Datos demográficos del paciente →   (secundario, no primario clínico)  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.6 Talla (I6)

```
Talla (cm o m)
┌──────────┐
│ 1.70     │
└──────────┘
Puede indicar cm o metros; se confirma al salir del campo.
```

### 6.7 Contador de clics (P7) — objetivo

```
Clic 1: [Editar consulta]     (solo si estaba en solo lectura)
Clic 2: foco en textarea de Alergias / tipar
        (si ya está "Editando", Clic 1 = foco en campo)
```

---

## 7. Roadmap interno del sprint

### Fase 1 — Descubribilidad crítica (P0)

| Orden | Iniciativa | Estimación relativa |
|-------|------------|---------------------|
| 1 | I0 Adoption (doc aprobado + checklist) | XS |
| 2 | I1 Visible Edit Mode | S |
| 3 | I2 Editable Antecedents | M |
| 4 | I3 Save Experience | S |

**Salida Fase 1:** médico edita y guarda antecedentes sin entrenamiento.  
**Estimación acumulada Fase 1:** **M–L** (aprox. 1 unidad de sprint FE enfocada).

### Fase 2 — Confianza documental y lenguaje (P1)

| Orden | Iniciativa | Estimación relativa |
|-------|------------|---------------------|
| 5 | I4 Documentation Gaps UX | S |
| 6 | I5 Clinical Navigation Language | S |

**Salida Fase 2:** pendientes comprensibles; cero jerga en superficies tocadas.  
**Estimación Fase 2:** **S–M**.

### Fase 3 — Pulido residual (P2)

| Orden | Iniciativa | Estimación relativa |
|-------|------------|---------------------|
| 7 | I6 Vital Signs UX | XS |
| 8 | I7 Navigation Rail UX + QA viewports | XS–S |

**Salida Fase 3:** cierre de fricciones HIGH residuales.  
**Estimación Fase 3:** **XS–S**.

### Orden recomendado de implementación (post-aprobación)

```
I0 → I1 → I2 → I3 → I4 → I5 → I6 → I7
```

Justificación: I1 habilita percepción de edición; I2 es el valor clínico; I3 cierra la confianza; I4–I5 evitan interpretaciones erróneas; I6–I7 son pulido.

### Validaciones obligatorias (cuando se autorice código)

- Lint / typecheck / tests FE afectados / build  
- Smoke manual: editar antecedentes → Guardar → F5 → datos OK  
- Gaps: mensaje dirty → Guardar → sync  
- Talla: digitación sin salto  
- Rail: último ítem alcanzable  
- **No** deploy hasta autorización explícita de promoción  

### Criterio de cierre CX-01

Prueba de oro (§1) PASS con médico o proxy clínico + checklist de principios P1–P7 en superficies tocadas.

---

## 8. Riesgos de programa

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Scope creep hacia H5–H8 / EPIC-4 | Alta | Freeze explícito en este doc |
| Tocar Foundation/gaps logic “para UX” | Alta | Solo copy/estado visual en I4 |
| Regresión de persistencia H1 al tocar UI | Alta | No alterar flush/API; tests de no regresión |
| PR grande ilegible | Media | Fases 1→2→3; PRs por fase si se autoriza split |
| Documento no aplicado | Media | Checklist en review de PRs clínicos |
| Backend “imprescindible” | Baja | No identificado; CX-01 es FE-only |

---

## 9. Dependencias

| Dependencia | Estado |
|-------------|--------|
| Tip FE `3efaad02` (H1–H4 funcionales) | En prod |
| Tip BE `e536419` (PE head/neck) | En prod |
| EPIC-3 congelado | Sí |
| Aprobación de este documento | **Pendiente** — gate antes de implementar |
| Auth Railway/Vercel para deploy | Fuera de CX-01 diseño |
| Backend | **Ninguna** prevista |

---

## 10. Gate de aprobación

**CX-01 no se implementa** hasta aprobación explícita de este documento por owner clínico / producto.

Tras aprobación, una autorización de ejecución separada iniciará el código (Fase 1).

---

## 11. Resumen ejecutivo

CX-01 convierte los hallazgos de Clinical Acceptance + UX Review en un **estándar de experiencia clínica** y un sprint FE acotado (I0–I7), sin reabrir EPIC-3 ni backend. El valor está en **descubribilidad, lenguaje clínico y feedback de guardado**, no en nueva lógica clínica.

| Pregunta | Respuesta |
|----------|-----------|
| ¿Hay bloqueo backend? | No |
| ¿Se puede implementar ahora? | No — falta aprobación de este doc |
| ¿Qué desbloquea Acceptance UX? | I1 + I2 + I3 |

---

*Fin del documento CX-01 — Clinical Experience. Solo diseño.*
