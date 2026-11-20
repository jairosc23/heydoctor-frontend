# HeyDoctor RC12.7 — Gate de contrato backend para apertura de ficha (18/11/2026)

**Estado: BLOCKED_BACKEND_CONTRACT**. Auditoría de fuentes GitHub en solo lectura, sin endpoint clínico productivo ni escritura clínica ejecutada.

## Evidencia verificable

- En backend `SAVAC-HeyDoctor/heydoctor-backend-pro`, archivo `heydoctor-backend-pro/src/consultations/consultations.controller.ts`, blob `4789a8df68a484aa1c79da39f51ea195f44fd8dc`, refs `main` y `rc/m9-staging-unified-20261103`: métodos `POST /`, `GET /`, `GET :id`, `PATCH :id`, `POST :id/start-call`, `POST :id/sign`; **no existe una ruta decorada `POST from-appointment/:appointmentId` en ese controlador**.
- Archivo `heydoctor-backend-pro/src/appointments/appointments.controller.ts` en main: revisados endpoints de appointments; tampoco aparece apertura de ficha desde cita.
- Frontend staging `d0b69a6274d469f5c247abc1c25b4bbbaa6f1932`: `lib/services/consultations.ts` define `openAppointmentConsultation(id)` que POST a `/consultations/from-appointment/${id}`; `components/agenda/AppointmentFormModal.tsx` llama ese método y permite abrir cita confirmada sin `consultationId` a médico no-admin.
- Frontend productivo `dde667559dcdac9417e6f6bccd17b2d81e6eee88`: ese método no existe y la UI solo abre ficha si está enlazada.

**Importante:** el código del backend GitHub no prueba el contenido del ZIP compilado que actualmente ejecuta Cloud Run; el commit exacto del código productivo sigue sin poder atribuirse a un árbol GitHub. Por lo tanto no se puede afirmar de forma concluyente ni que el endpoint exista ni que no exista en el backend activo. No enviar solicitudes de escritura de cita/consulta a producción para descubrirlo.

## Decisión

1. **NO portar** `openAppointmentConsultation` ni la mutación de agenda al candidato hasta obtener contrato real del backend productivo y guardias (médico propietario, clínica, estado permitido, anti-duplicación/idempotencia, ficha firmada y controles de consentimiento).
2. Alternativas seguras: inspección read-only del archivo ZIP fuente productivo por generación ya identificada (sin imprimir valores sensibles), o revisión del OpenAPI productivo accesible y autorizado **solo lectura**. Si no se acredita, implementar y certificar el contrato en backend staging/sintético y planificar un release coordinado con rollback, mediante autorización específica.
3. La ruta invitado por fragmento y middleware fue incorporada de forma selectiva en [PR draft #135](https://github.com/jairosc23/heydoctor-frontend/pull/135). El `TeleconsultaVideoSession.tsx` es idéntico en ambas referencias de frontend, pero sigue pendiente CI/E2E del SHA candidato y pruebas de expiración/aislamiento del token frente al backend real.
4. **No GO** ni merge/deploy, no tocar pagos, Cloud SQL, MFA o firmas clínicas. Esta acta documenta un gate, **no** certifica compatibilidad productiva.
