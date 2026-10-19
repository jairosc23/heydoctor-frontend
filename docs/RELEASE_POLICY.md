# Política de releases — HeyDoctor Frontend

Alineada con SemVer y el flujo descrito en el backend; este repo versiona **de forma independiente** (tags `v*` propios).

## SemVer

| Bump | Formato | Cuándo |
|------|---------|--------|
| **MAJOR** | `v2.0.0` | Breaking changes (API del cliente, rutas, contratos con el usuario). |
| **MINOR** | `v1.1.0` | Nuevas features compatibles. |
| **PATCH** | `v1.0.1` | Fixes, docs, ajustes de build/config sin cambio funcional mayor. |

## Reglas

1. **No modificar tags ya publicados** en `origin`.
2. **Tag anotado** por cada release: `git tag -a vX.Y.Z -m "..."`.
3. **GitHub Release** se crea al hacer push del tag vía [`.github/workflows/release.yml`](../.github/workflows/release.yml).
4. **`main` siempre deployable** — Vercel puede desplegar desde `main`; coordinar con backend cuando haya dependencias de API.

## Flujo

1. PR → merge a `main`.
2. `git tag -a vX.Y.Z -m "mensaje"` → `git push origin vX.Y.Z`.
3. GitHub Actions genera el release con notas automáticas.
4. Vercel sigue la configuración actual del proyecto (sin cambios impuestos por este workflow).

## CI en GitHub (bloqueo de merge)

El workflow `.github/workflows/ci.yml` corre en push y pull_request a `main` (install, `tsc --noEmit`, build, smoke test). Para **bloquear merge si falla**: **Settings → Branches** → proteger `main` → **Require status checks** → añadir **`CI / frontend`**.

## Referencias

- Backend (política detallada y monorepo): repositorio `heydoctor-backend-pro` — `docs/RELEASE_POLICY.md`.
- [COMMITS.md](./COMMITS.md) — Conventional Commits.

## Opcional (futuro)

- commitlint / Husky / semantic-release — ver política del repo backend.
