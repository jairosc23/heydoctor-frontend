# Agenda Enterprise — Fase 8 certificada (UX Enterprise)

> Branch: `feature/agenda-enterprise`  
> Medical Copilot: **no modificado** · Backend: **sin cambios**

## Auditoría UX (antes)

- Página apilaba paneles F1–F7 en un scroll vertical largo
- Loaders/empty/error inconsistentes entre superficies
- Sin navegación por sección ni indicadores globales
- Calendario competía visualmente con herramientas enterprise

## Diseño técnico (después)

| Pieza | Rol |
|-------|-----|
| `AgendaWorkspaceNav` | Tabs accesibles (tablist) |
| `AgendaCollapsible` | Paneles colapsables bare |
| `AgendaStatusBadge` | Indicadores / tooltips nativos (`title`) |
| `AgendaSkeleton` | Loading unificado |
| `agenda-workspace.ts` | IDs de sección (solo presentación) |

Los paneles F1–F7 se reutilizan sin alterar props ni lógica de dominio.

## Mejoras

- Workspace en 4 secciones: Calendario · Disponibilidad · Operaciones · Zona horaria
- Badges: citas, slots, bloques, waitlist, reminders, admin/error/success
- Actualizar todo (invalidación React Query unificada)
- Empty / error / skeleton en calendario
- Responsive tabs + toolbar
- Accesibilidad: roles tab/tabpanel, aria-pressed, aria-expanded

## Fuera de alcance

Dashboard · Analytics · Calendarios externos · nuevas APIs/entidades
