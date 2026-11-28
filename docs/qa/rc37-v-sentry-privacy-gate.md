# RC37-V — gate de privacidad Sentry QA

Base: PR #155, `989b7a01a7f46bb09b127b03254d318eee3da0dc`, sobre QA `7bd83b5f7eccca786efe0303385cdd58ede04478`.
Fecha: 28/11/2026, America/Santiago. Solo frontend Railway qa-isolated.

## Contrato efectivo SDK 11.20.0

Se inspeccionaron los archivos instalados por npm ci, fijados por package-lock:
`@sentry/core/build/esm/client.js` (sendEnvelope), `transports/base.js` (serialización), `types/options.d.ts`, `types/datacollection.d.ts`, `types/envelope.d.ts`; `@sentry/node/build/esm/sdk/index.js`; `@sentry/nextjs/build/esm/server/index.js`.

Hallazgos: beforeSend no controla todos los sobres; sendDefaultPii ya no es una opción de NodeOptions en esta versión, sustituida por dataCollection. beforeSendSpan no permite devolver null en su contrato 11.20.0. No se fuerza ninguna conversión para fingir compatibilidad.

## Corrección estructural

- Única inicialización Node con SENTRY_DSN servidor, ligada al proyecto/entorno/servicio Railway QA y al proyecto Sentry `4512510799577088`, host `o4511407657123840.ingest.us.sentry.io`. No fallback al DSN público. Cualquier DSN ajeno o variable pública no vacía deshabilita la inicialización.
- Navegador y edge: sin inicialización, incluso si alguien configura NEXT_PUBLIC_SENTRY_DSN accidentalmente.
- dataCollection: deshabilita usuario, cookies, headers, cuerpos HTTP, query, GraphQL, genAI/MCP, datos de consultas, colas, variables de stack y líneas de contexto.
- Sin integraciones automáticas, OpenTelemetry ni profiling. Tracing a cero. beforeSendLog, beforeSendMetric, beforeSendTransaction y beforeBreadcrumb descartan sus entradas. Client reports y Spotlight deshabilitados.
- Transporte final envuelve makeNodeTransport. Admite exactamente un item event de error, sin type explícito, con ID válido, y reconstruye su contenido constante mediante sanitizeSentryEvent. Descarta adjuntos y reconstruye los headers como event_id y sent_at generado; no conserva trace, baggage, SDK ni headers arbitrarios. Un error de saneamiento no produce salida ni imprime la excepción.
- El contenido conservado no proporciona diagnóstico clínico detallado: es un diagnóstico QA constante. No debe promoverse silenciosamente a producción ni habilitar captura browser.

| Canal SDK | Política antes de red |
|---|---|
| event de error | Mensaje/nivel/tags/fingerprint constantes; solo ID/timestamp válidos; headers nuevos |
| transaction, span | Descartados; tracing cero |
| session, sessions, client_report | Descartados; informes deshabilitados |
| attachment, user_report, feedback | Descartados |
| profile, profile_chunk | Descartados; profiling cero |
| replay_event, replay_recording | Descartados; navegador deshabilitado |
| log, metric, trace_metric | Descartados; callbacks null |
| check_in, raw_security, tipos futuros | Descartados por allowlist cerrada |

No se modifica ninguna entidad, ruta clínica, WebRTC, backend, pago o configuración productiva.

## Evidencia local ejecutada

- npm ci --ignore-scripts --no-audit --no-fund: PASS; SDK 11.20.0 real, sin modificar dependencias.
- npm run typecheck: PASS.
- npm test: 1.853 PASS, 0 FAIL, 0 omitidos, 907 suites. Incluye 30 tests de privacidad (dos originales y 28 nuevos).
- npm run test:component: 256 PASS en 68 archivos. Incluye teleconsulta/video y página de invitado existentes; no se repite M4 ni se crean citas.
- npm run build: PASS, DSN servidor/público vacíos, NEXT_TELEMETRY_DISABLED=1.
- Artefacto .next/server/instrumentation.js: register() ejecutado sin DSN, SDK no inicializado.
- Captura mediante NodeClient real 11.20.0 con usuario, error y adjunto ficticios, usando transporte de grabación sin red: exactamente un evento saneado y cero adjuntos. Sesión posterior descartada. No equivale a recepción runtime en Sentry.

Warnings existentes del build: convenciones middleware/Edge Runtime deprecadas. No se amplía el alcance para migrarlas.

## Gates runtime pendientes de registrar en el PR

La recepción Sentry se certifica solo con evento de la versión QA desplegada, ID correlacionado y lectura del evento recibido. Flush o HTTP 200 por sí solos no prueban recepción ni privacidad.
ADMIN 200 / DOCTOR 403 requieren sesiones sintéticas legítimas y MFA cuando aplique. Los tests de metadata/guard no sustituyen esos HTTP. La credencial RC18 de médico estaba vacía en la inspección previa; no se generan tokens, no se resetea MFA ni se crean usuarios para eludir el bloqueo.

## Despliegue QA y reversión

1. Conservar despliegue frontend previo `0e0301a9-a07a-4f82-8d55-3b401d6b6e40`, SHA `7bd83b5f7eccca786efe0303385cdd58ede04478`, sin DSN.
2. Fijar candidato revisado únicamente al servicio frontend QA. Revisar staged changes y rechazar cualquier otro recurso. Desplegar con DSN ausente y observar SUCCESS + /api/health 200.
3. Configurar exclusivamente SENTRY_DSN QA por canal seguro, con NEXT_PUBLIC_SENTRY_DSN ausente. Verificar el nuevo despliegue y su mismo SHA antes de una captura sintética.
4. Una sola captura de mensaje fijo desde la instrumentación compilada; sin iniciar backend, sin consultas clínicas ni credenciales de pacientes. Verificar ID y contenido en Sentry.
5. Si falla privacidad o salud, deshabilitar el DSN QA antes de cualquier reversión; nunca devolver tráfico a una versión de saneamiento anterior con DSN activo. Revertir solo frontend QA al despliegue preservado, sin tocar backend ni main.

No hay merge a main ni cambios de producción autorizados por este documento.
