# Business Applications Epic 2 — Medical Director Console

**Type:** functional analysis (pre-design)  
**Status:** **REJECTED BY ARCHITECTURE**  
**Decision:** 2026-08-25  
**Platform:** CORE_PLATFORM LTS · PRODUCT_PLATFORM v6.0 LTS  
**Depends on:** Business Applications Epic 1 — Digital Clinic (CERTIFIED; not modified)

No es un fallo de implementación. Es una decisión de arquitectura. El Epic **no continúa**. No hay diseño. No hay implementación.

This document does not change Core Platform, Architecture Baseline, Product Platform v6.0, Digital Clinic Epic 1, RC-19A, Auth, Workspace, Foundation, Branding, WebRTC, portal, or agenda.

---

## Preguntas del análisis

### 1. ¿Existe realmente un vacío funcional?

**No**, para Dirección Médica en el recorte de una clínica operable sobre LTS.

Lo que una dirección médica necesita **hoy** para dirigir el centro:

| Necesidad real de clínica | ¿Cubierta? |
|---------------------------|------------|
| ¿Hay presión de entrega, caja, continuidad o arranque? | Sí — Operational Pulse v5.0 |
| ¿A qué tablero mando al equipo? | Sí — CTAs del pulso a v1.0 y v2.0; proceso Dirección Médica de Digital Clinic |
| ¿Qué documentos no se entregaron? | Sí — Clinical Delivery Queue (trabajo, no dirección) |
| ¿Qué Encounter no cerró caja? | Sí — Revenue Integrity (trabajo de administración) |
| ¿Qué retomar en un paciente? | Sí — Pre-Visit Brief (médico, no consola de dirección) |
| ¿Cuál es el hilo de un paciente? | Sí — Longitudinal Continuity (médico) |

Lo que a veces se pide como “consola de dirección” y **no** está en LTS (credenciales, privilegios, comités, QMS, multi-sede) **no** es un consola de pulso: son hechos de negocio nuevos (ya BLOQ en Digital Clinic). No se resuelven con un Epic 2 de consola.

### 2. ¿Ese vacío pertenece a Business Applications?

No hay vacío de **consola**. El proceso de Dirección Médica **ya es** Business Applications (Epic 1, proceso 3, BA-11). Un segundo Epic de negocio para el mismo actor y la misma URL (`/panel/pulso-operativo`) no pertenece a una aplicación nueva: es duplicar Epic 1.

Los huecos de gobierno clínico (staff médico, acreditación) no son consola LTS; exigirían hechos que Product Platform no certifica.

### 3. ¿Puede resolverse reutilizando LTS?

**Sí**, y **ya está resuelto**:

- Product: v5.0 `/panel/pulso-operativo`
- Business: `navigateDireccion()` → solo el pulso; Operaciones rutea a v1.0/v2.0 si hay atasco

No hace falta otra capa.

### 4. ¿Duplicaría algún Epic existente?

**Sí**, si se abriera:

| Si el Epic 2 fuera… | Duplicaría |
|---------------------|------------|
| Un dashboard de KPIs de centro | v5.0 Operational Pulse |
| Un playbook “abrir pulso y derivar” | Digital Clinic — Dirección Médica |
| Pulso + cola + cubos en una pantalla | v5.0 (ya compone) + viola BA-11 (no embeber v1/v2) |
| Lista de pacientes con brief `empty` / handoff `absent` | v3.0/v4.0/v5.0 (el pulso ya cuenta; no lista) |
| Ronda por ficha | Atención (Epic 1), no dirección |

### 5. ¿Requiere nueva arquitectura?

**No.** Abrirlo **sí** exigiría, para “agregar valor”, una de: nueva ruta/shell (rompe BA-5/BA-12), embeber tableros (rompe BA-11 y OPD-1), lista de pacientes (el pulso no es worklist), reloj “hoy”, o un dominio de gobierno clínico. Nada de eso es LTS consume-only.

### 6. ¿Debe existir como Epic independiente?

**No.**

### 7. Recomendación final

**REJECTED BY ARCHITECTURE.**

Dirección Médica ya tiene: (1) la fotografía de centro certificada (v5.0) y (2) el proceso de negocio certificado que la consume (Digital Clinic). Una “Medical Director Console” no añade una pregunta de negocio distinta. Sería un segundo nombre para el pulso o una violación del recorte de Epic 1.

No diseñar. No implementar.

---

## Cobertura actual (referencia)

```
Dirección médica
    └── Digital Clinic · proceso direccion     [BA Epic 1 CERTIFIED]
            └── /panel/pulso-operativo         [Product v5.0 LTS]
                    ├── deriva a /panel/entrega-clinica     [v1.0]
                    └── deriva a /panel/integridad-ingresos [v2.0]
```

Operaciones (Epic 1) coordina el atasco; no es consola de dirección. Atención y Caja no son Dirección.

---

**Siguiente paso:** no hay diseño. Esperar autorización explícita antes de cualquier otro Epic de Business Applications.
