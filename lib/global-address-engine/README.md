# Global Address Engine (GAE)

```
GLOBAL ADDRESS ENGINE
VERSION 1.1
STATUS
PRODUCTION READY
```

Source of Truth única de direcciones geográficas en el frontend HeyDoctor.

Documento de cierre: [`docs/architecture/GAE-V1.1-FINAL.md`](../../docs/architecture/GAE-V1.1-FINAL.md).

## Arquitectura

```
countries.ts              → lista ISO (nacionalidad + residencia)
catalogs/*.json           → catálogos oficiales (SSOT datos)
catalogs/index.ts         → SPECIALIZED_CATALOGS
adapters/catalog-adapter  → factory desde JSON
adapters/generic          → fallback sin catálogo
adapters/registry         → resolución por ISO-2
engine.ts                 → cascada + labels + field states
map-to-patient-fields.ts  → compatibilidad DTO paciente
age.ts                    → edad desde birthDate

components/global-address → única UI autorizada
```

Principios:

1. Un solo SSOT de datos geográficos (`lib/global-address-engine`).
2. Nacionalidad ≠ país de residencia.
3. País de residencia es el maestro de la cascada.
4. Sin listas hardcodeadas en formularios.
5. Persistencia legacy sin cambio de API.

## Países soportados (21)

| ISO | País | Admin1 (select) | Admin2+ |
|-----|------|-----------------|---------|
| CL | Chile | Región | Provincia, Comuna (**catálogo**) |
| CO | Colombia | Departamento | Municipio (texto) |
| AR | Argentina | Provincia | Departamento / Partido (texto) |
| BR | Brasil | Estado | Município (texto) |
| PE | Perú | Departamento | Provincia, Distrito (texto) |
| MX | México | Estado | Municipio (texto) |
| UY | Uruguay | Departamento | Localidad (texto) |
| PY | Paraguay | Departamento | Distrito (texto) |
| EC | Ecuador | Provincia | Cantón (texto) |
| BO | Bolivia | Departamento | Provincia (texto) |
| VE | Venezuela | Estado | Municipio (texto) |
| CR | Costa Rica | Provincia | Cantón (texto) |
| PA | Panamá | Provincia | Distrito (texto) |
| GT | Guatemala | Departamento | Municipio (texto) |
| DO | República Dominicana | Provincia | Municipio (texto) |
| SV | El Salvador | Departamento | Municipio (texto) |
| HN | Honduras | Departamento | Municipio (texto) |
| NI | Nicaragua | Departamento | Municipio (texto) |
| ES | España | Comunidad Autónoma | Provincia, Municipio (texto) |
| US | Estados Unidos | State / Estado | County, City (texto) |
| CA | Canadá | Provincia / Territorio | Ciudad (texto) |

Otros ISO → adaptador genérico (texto libre).

## Estrategia de adaptadores

1. Si el ISO está en `SPECIALIZED_CATALOGS` → `createCatalogAdapter`.
2. `hasCatalog` por nivel se deriva de la presencia de hijos en el JSON.
3. Sin hijos en admin2+ → UI en modo texto (sin inventar datos).
4. ISO desconocido → `createGenericAdapter` (labels genéricos).

## Convenciones

- Códigos de país: ISO-3166-1 alpha-2.
- Archivo de catálogo: un país por JSON; `countryCode` obligatorio.
- Labels: siempre `{ es, en }` en cada nivel.
- No exportar arrays de países/regiones desde componentes.
- Mapper: `stateProvince` ← admin1; `city` ← nivel local más profundo.

## Persistencia (sin cambio de contrato)

- `country`, `stateProvince`, `city`, `addressLine1`, `addressLine2`, `postalCode`

## Extensión futura (GAE v2)

Ver roadmap en `docs/architecture/GAE-V1.1-FINAL.md`. Resumen:

- Catálogos admin2/admin3 (CO, MX, BR, ES, US prioritarios).
- Endpoint BE opcional de catálogos.
- Migrar Clínicas / Facturación / Marketplace.
- Unificar Doctor Apply a ISO-2.
- Geocoding / postales solo detrás de interfaz dedicada.

**v1.1 no incorpora** geocoding, postales ni nuevos países más allá de los 21 listados.
