# Diagnóstico E2E — auth timeout (post-estabilización frontend)

**Fecha:** 2026-05-23  
**Rama frontend (preview):** `fix/frontend-platform-stabilization`  
**Estado merge:** **NO merge a `main`** hasta validar auth E2E con backend corregido.

## Resumen ejecutivo

La estabilización frontend resolvió blur global, overlay infinito, hydration freeze, refresh bootstrap anónimo y login freeze de UI. El bloqueo restante (**login transaction timeout 25s**) está **aislado en la capa backend/transporte**, no en React ni en `AuthProvider`.

## Smoke test (confirmado)

| Síntoma | Estado |
|---------|--------|
| Blur global | ✅ Resuelto |
| Overlay infinito | ✅ Resuelto |
| Hydration freeze | ✅ Resuelto |
| Refresh bootstrap anónimo | ✅ Resuelto |
| Login freeze permanente (UI) | ✅ Resuelto |
| Login transaction timeout 25s | ❌ Pendiente |
| Auth flow backend/transporte | ❌ Pendiente |

## Flujo login frontend (25s)

Secuencia en preview (`lib/auth-client.ts`, `lib/services/auth.ts`):

1. `bootstrapApiCsrf()` → `GET /api/auth/csrf` (timeout 15s)
2. `authLogin()` → `POST /api/auth/login` (timeout 15s)
3. `getMe({ skipRefreshRetry: true })` → `GET /api/auth/me`
4. Todo envuelto en `withTimeout(..., AUTH_HYDRATION_MAX_MS=25000, "login-transaction")`

Si el paso 1 o 2 cuelga en el servidor, el usuario ve timeout a los 25s con mensaje `login-transaction`.

## Pruebas curl contra producción

**API:** `https://pro-api.heydoctor.health` (Railway: `heydoctor-backend-pro-production-f81c.up.railway.app`)

| Endpoint | Latencia | Resultado |
|----------|----------|-----------|
| `/`, `/health`, `/healthz`, `/readyz` | ~0.4–0.6s | OK |
| `/api/health/ready` | ~0.4s | OK — DB ok; **Redis socketIo `degraded`, status `ended`** |
| `/api/users`, `/api/growth/flags` (404) | ~0.4s | 404 rápido |
| **`GET /api/auth/csrf`** | **>8–15s** | **0 bytes, timeout** |
| **`GET /api/auth/me`** | **>8–15s** | **0 bytes, timeout** |
| **`GET /api/growth/context-public`** | **>8–15s** | **0 bytes, timeout** |
| `OPTIONS /api/auth/csrf` (CORS preflight) | ~0.4s | 204 |

### Patrón observado

- Rutas **sin handler** (404): responden al instante.
- Rutas **con handler** y `@SkipThrottle()` (`/api/health/ready`): responden al instante.
- Rutas **con handler** protegidas por `ThrottlerGuard` global: **cuelgan** hasta timeout del cliente.

## Causa raíz (backend)

`ThrottlerModule` en `heydoctor-backend-pro` usa `ThrottlerStorageRedisService` cuando `REDIS_URL` está definido. En producción, readiness reporta Redis en estado **`ended`**. Las operaciones del throttler contra Redis no completan → **`ThrottlerGuard` bloquea todas las rutas matcheadas** antes de llegar al controller.

Los endpoints de health usan `@SkipThrottle()` y por eso siguen respondiendo.

## Fix propuesto (backend, rama separada)

**Rama:** `fix/auth-throttler-redis-fallback` @ `74e5d94`  
**PR:** https://github.com/SAVAC-HeyDoctor/heydoctor-backend-pro/pull/new/fix/auth-throttler-redis-fallback

1. **`ResilientThrottlerStorage`** — PING al boot; `commandTimeout` + `enableOfflineQueue: false`; fallback in-memory en boot o runtime (`ended`, timeout, error).
2. **`@SkipThrottle()` en `AuthController`** — auth de sesión no depende del throttler.
3. **Smoke deploy** — `GET /api/auth/csrf` debe responder < 2s.

**Operacional (Railway):** reiniciar addon Redis; verificar `/api/health/ready` → `socketIoRedis.status` ≠ `ended`.

Ver también backend: `heydoctor-backend-pro/docs/AUTH_THROTTLER_RESILIENCY.md`.

## Validación post-fix

```bash
# Debe responder < 2s con JSON/cookies
curl -sS -o /dev/null -w "%{http_code} %{time_total}s\n" \
  "https://pro-api.heydoctor.health/api/auth/csrf"

# Login desde preview Vercel (rama fix/frontend-platform-stabilization)
# → sin timeout 25s; sesión estable
```

## Decisión de merge

| Repo | Rama | Acción |
|------|------|--------|
| `heydoctor-frontend` | `fix/frontend-platform-stabilization` | Mantener PR abierto; merge solo tras E2E OK |
| `heydoctor-backend-pro` | `fix/auth-throttler-redis-fallback` (propuesta) | Desplegar preview/staging → re-smoke → prod |

## Referencias

- [FRONTEND_PLATFORM_STABILIZATION.md](./FRONTEND_PLATFORM_STABILIZATION.md) — fixes frontend
- Backend: `src/app.module.ts`, `src/config/throttler-storage.factory.ts`, `src/auth/auth.controller.ts`
