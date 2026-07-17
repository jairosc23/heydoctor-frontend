# Medical Copilot RC6 — Recovery Guide

## Runtime failures

| Síntoma | Acción |
|---|---|
| Timeouts / circuit open | Revisar RC5 resilience metrics; no reintentar en bucle |
| Drift test fail | No “arreglar” borrando baseline; investigar cambio breaking |
| Persistencia rolled_back | Revisar audit `GOVERNED_CONSULTATION_PERSISTENCE_*`; ownership/optimistic lock |
| Kill-switch activo inesperado | Verificar env/runtime status; no forzar enable en prod sin cambio |

## Data / session

- Foundation store + TTL scheduler: sesiones expiradas se purgan según política existente
- Ownership mismatch: rehidratar sesión vía flujo certificado; no crear sessions huérfanas

## Rollback de release

1. Revertir deploy de la versión promovida (post-RC6, fuera de este freeze)
2. Mantener branch RC como fuente certificada
3. No recrear packages/endpoints para “recuperar” funcionalidad

## RC6 note

Este guide documenta recuperación; **RC6 no ejecuta rollback ni deploy**.
