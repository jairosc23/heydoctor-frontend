# Medical Copilot RC6 — Maintenance Guide

## Allowed during freeze

- Documentación de certificación
- Fixes de tooling/gates que no alteren contratos
- Hotfixes de seguridad críticos con proceso aparte (fuera de alcance RC6 nominal)

## Forbidden during freeze

- Nuevos engines / workflows / packages / endpoints / builders / panels
- Ampliación de SSOT
- Refactors masivos de facade/application
- Eliminación agresiva de “código muerto” sin auditoría clínica

## Observability maintenance

- Métricas RC5 son in-process; reinicio de proceso reinicia ring buffers
- Revisar diagnostics JSON tras suites locales

## Dependency hygiene

RC6 audit inventaría dependencias/exports; **no** ejecuta purge automático de unused deps (riesgo de romper freeze).
