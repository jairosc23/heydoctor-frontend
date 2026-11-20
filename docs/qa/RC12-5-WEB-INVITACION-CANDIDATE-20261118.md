# HeyDoctor RC12.5 — Candidato web controlado, matriz de integración P0 (DRAFT)

Corte 18/11/2026. **Rama basada exactamente en frontend productivo** `dde667559dcdac9417e6f6bccd17b2d81e6eee88` (Railway deployment `9a0b451c-fed8-4eb3-8e04-9dcd595b6985`). Esta rama **NO ES todavía una implementación candidata funcional**: solo establece baseline inmutable y matriz de revisión. No fusionar ni desplegar.

## Alcance permitido
MVP web **por invitación**, médico agenda cita autorizada → abre ficha conforme RBAC → paciente accede mediante invitación temporal → teleconsulta segura. **Excluidos** self-booking con checkout obligatorio, cambios de pagos Payku/Stripe, releases App Store, migraciones irreversibles, cambios clínicos de guardias y configuración productiva.

## Comparación realizada (GitHub, refs inmutables)
| Componente | Baseline productivo `dde66755` | Staging `d0b69a62` | Resolución |
|---|---|---|---|
| `components/agenda/AppointmentFormModal.tsx` | Sin importación `openAppointmentConsultation` | Importa `openAppointmentConsultation` de `@/lib/services/consultations` y permite flujo de apertura de ficha | No copiar archivo entero: revisar diff y contrato del backend productivo. Preservar guardia de roles y ficha firmada |
| `app/teleconsulta/invitado/page.tsx` | Inexistente (404 en ref productiva) | Existe, lee token del fragmento URL, verifica formato UUIDv4 y monta `TeleconsultaVideoSession` en modo `guest` | Requiere dependencia completa de componentes, validación en backend, caducidad y aislamiento, no basta el formato del UUID |
| `middleware.ts` | Ruta invitado no acreditada pública | Modifica allowlist exacta de ruta invitado | Revisar apertura específica y garantizar que no amplíe permisos de rutas clínicas |
| `components/VideoCall.tsx`, `hooks/useTelemedicineCall.ts` | Revisión pendiente | M4 recuperación WebRTC validada en staging | Revisar delta, librerías y guardia de participantes sin duplicar certificación M4 |
| `lib/services/payments.ts` | Integración distinta de staging | Cambia endpoint a `/payments/*` | **Excluir explícitamente** del candidato sin pagos |

## Gate de ingeniería obligatorio antes de implementar
1. Producir diffs acotados por archivo y mapa de dependencias; verificar los endpoints en backend Cloud Run por evidencia de código/contratos; no inferir equivalencia de commit a partir de digest.
2. Implementar un cambio P0 mínimo por commit, con test correspondiente y protecciones de acceso conservadas.
3. Ejecutar lint, TypeScript, build, y QA sintético de acceso médico/ficha y paciente/invitado en **ambiente aislado** (sin alterar producción ni datos clínicos).
4. Construir matriz de compatibilidad de **pareja FE candidata + BE aprobado** y asegurar rollback del par: FE Railway baseline `9a0b451c-fed8-4eb3-8e04-9dcd595b6985` (`canRollback=true` según API) y BE Cloud Run `heydoctor-backend-prod-00006-7wd` / digest `sha256:2f498281c48a3f977967b582fbf391683d26df5477d53b578915799691f323e7`. No prometer rollback si hubo migración irreversible.
5. Exigir autorización separada para fusionar/desplegar, y verificación de costos y seguridad.

## Estado
- **RC12_FE_BASELINE_IDENTITY=PASS**.
- **RC12_5_BRANCH=CREATED_FROM_PROD_SHA**.
- **RC12_5_P0_CODE=NOT_IMPLEMENTED**.
- **RC12_ROLLBACK_EXECUTION=NOT_TESTED**.
- **GO/NO-GO global: NO-GO**, no modificar seguridad, pagos, producción ni datos.

Referencias: expediente backend [issue #150](https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/issues/150); matrices [PR #153](https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/pull/153) y rollback [PR #152](https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/pull/152).
