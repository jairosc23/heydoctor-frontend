# Global Address Engine — v1.1 Final

```
GLOBAL ADDRESS ENGINE
VERSION 1.1
STATUS
PRODUCTION READY
```

**Alcance:** Frontend (`heydoctor-frontend`)  
**Backend:** sin cambios  
**Fecha de cierre documental:** 2026-07-20

---

## 1. Objetivos

1. Establecer una **Source of Truth única** para países y niveles administrativos en HeyDoctor.
2. Separar **nacionalidad** de **país de residencia**.
3. Adaptar labels administrativos por país (Región / Estado / Departamento / …).
4. Ofrecer un componente reutilizable para Pacientes, Profesionales y formularios públicos.
5. Cubrir los **21 mercados objetivo** con catálogo oficial de **admin level 1**.
6. Mantener compatibilidad con el DTO plano de pacientes (`country`, `stateProvince`, `city`, …).

---

## 2. Decisiones arquitectónicas

| Decisión | Justificación |
|---|---|
| SSOT solo en frontend (`lib/global-address-engine`) | Sin cambio de contratos/API; adopción inmediata en formularios. |
| Adaptadores por país + fallback genérico | Labels y catálogos correctos sin hardcode en UI. |
| Catálogos JSON por país en `catalogs/` | Un archivo = un país; extensión sin tocar componentes. |
| Registro central `SPECIALIZED_CATALOGS` | Evita duplicar wiring en el registry. |
| Admin1 select; admin2+ texto libre (excepto Chile) | Datos oficiales disponibles hoy sin bloquear UX. |
| Chile conserva cascada Región→Provincia→Comuna | Mercado base con catálogo profundo ya validado. |
| Mapper a campos legacy de paciente | Persistencia y APIs sin migración. |
| Edad derivada de `birthDate` en el mismo módulo | Consistencia clínica; no campo editable. |

**No incluidos en v1.1 (explícitamente fuera de alcance):**

- Geocoding / autocompletado de calles.
- Validación o catálogo de códigos postales.
- Catálogos admin2/admin3 para mercados no-CL.
- Cambios de backend o schema.

---

## 3. Cobertura funcional

### 3.1 Módulo SSOT

```
lib/global-address-engine/
  countries.ts                 # ISO países (nacionalidad + residencia)
  catalogs/*.json (21)         # catálogos oficiales
  catalogs/index.ts            # SPECIALIZED_CATALOGS
  adapters/                    # catalog-adapter, generic, registry
  engine.ts                    # cascada + field states
  map-to-patient-fields.ts     # proyección DTO paciente
  age.ts                       # edad desde birthDate
```

### 3.2 UI oficial

```
components/global-address/
  GlobalAddressFields
  NationalityField
  AgeFromBirthDateField
```

Consumidores v1.1: Patient Intake, Patient Profile, Doctor Apply, Professional Profile.

### 3.3 Países soportados (21)

CL, CO, AR, BR, PE, MX, UY, PY, EC, BO, VE, CR, PA, GT, DO, SV, HN, NI, ES, US, CA.

Detalle de labels y profundidad: `lib/global-address-engine/README.md`.

### 3.4 Validación

- Lint / typecheck: PASS  
- Tests GAE (`lib/global-address-engine/**/*.test.ts`): PASS  
- Auditoría SSOT automatizada: sin listas geográficas duplicadas fuera del módulo  

---

## 4. Limitaciones conocidas

1. **Admin2/admin3** incompletos fuera de Chile (texto libre).
2. **Códigos admin1** son convencionales (ISO/nacionales); hidratación desde texto legacy puede no resolver código.
3. **Doctor Apply** sigue enviando etiqueta de país (legacy) aunque el select usa ISO SSOT.
4. Formularios futuros (Clínicas, Facturación, Marketplace) deben adoptar `GlobalAddressFields` — aún no migrados si no existían.
5. Sin geocoding ni normalización postal.

---

## 5. Roadmap GAE v2 (futuro)

Orden sugerido; no autorizado en v1.1:

1. Catálogos admin2/admin3 oficiales (prioridad: CO, MX, BR, ES, US).
2. Endpoint BE opcional de catálogos (cacheable) sin romper el contrato del adapter.
3. Migración de Clínicas / Sucursales / Facturación / Marketplace al mismo componente.
4. Unificar payload Doctor Apply a ISO-2.
5. Evaluación de geocoding (proveedor externo) detrás de interfaz, nunca en UI.
6. Códigos postales por país donde exista dataset confiable.

---

## 6. Convenciones de extensión (post v1.1)

1. Añadir `catalogs/<country>.json` con `levels` + `admin1[]` (y anidados solo si hay dataset oficial).
2. Registrar en `catalogs/index.ts`.
3. Ampliar tests de labels/admin1.
4. **No** duplicar listas en componentes.
5. **No** cambiar el shape de `PatientAddressFields` sin ADR.

---

## 7. Estado de cierre

| Ítem | Estado |
|---|---|
| Arquitectura SSOT | Completa |
| 21 mercados admin1 | Completo |
| Cascada Chile | Completa |
| Componentes oficiales | En producción |
| Documentación técnica | Completa (este documento + README módulo) |
| Merge/deploy de esta expansión LATAM | Pendiente de PR separado (si aplica) |

**Tag documental interno**

```
GLOBAL ADDRESS ENGINE
VERSION 1.1
STATUS
PRODUCTION READY
```
