# Conventional Commits — HeyDoctor Frontend

Mismo estándar que el monorepo backend para mantener historial y release notes coherentes.

## Formato

```
<tipo>[alcance opcional]: <descripción corta>
```

## Tipos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `refactor` | Refactor sin cambio de comportamiento |
| `perf` | Rendimiento |
| `test` | Tests |
| `chore` | Infra, deps, config |
| `ci` | GitHub Actions / pipelines |

## Ejemplos

```
feat(auth): add cookie-based CSRF header to api client
fix(panel): correct clinic loading state on error
docs(release): add SemVer policy
chore(deps): bump next to 14.2.x
ci(release): add tag-triggered release workflow
```

## Breaking changes

```
feat(routing)!: remove legacy /dashboard path

BREAKING CHANGE: use /panel only.
```

Más detalle: [Conventional Commits](https://www.conventionalcommits.org/).
