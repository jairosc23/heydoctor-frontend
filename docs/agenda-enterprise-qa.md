# Agenda Enterprise — QA Manifest (Fase 10)

> Branch: `feature/agenda-enterprise`  
> Frontend baseline F9: `99f694f8` · Backend HEAD: `82841419` · Fase 10: docs + hardening comentario  
> Medical Copilot: **congelado / no modificado**  
> Alcance: validación y documentación — **sin nuevas funcionalidades**

---

## Objetivo QA

Certificar que las Fases 1–9 permanecen consistentes, reutilizan el SSOT Backend y están listas para consideración de merge (no para deploy automático).

---

## Matriz de integridad Fases 1–9

| Fase | Superficie | FE | BE SSOT | Estado |
|------|------------|----|---------|--------|
| 1 | Availability | `AgendaAvailabilityPanel` + `useAvailabilityEnterpriseQuery` | `GET /api/appointments/availability/rules`, `GET .../slots` | ✔ |
| 2 | Rules | `AgendaAvailabilityRulesPanel` | `POST/PATCH/DELETE .../availability/rules` | ✔ |
| 3 | Slots | `AgendaSlotsPanel` + view-model | Slots BE + citas `GET /api/appointments` | ✔ |
| 4 | Blocks | `AgendaBlocksPanel` | `GET/POST/PATCH/DELETE .../blocks` | ✔ |
| 5 | Waitlist | `AgendaWaitlistPanel` | `GET/POST/PATCH/DELETE .../waitlist` | ✔ |
| 6 | Reminders | `AgendaRemindersPanel` | policies + instances `/reminders*` | ✔ |
| 7 | Timezone | `AgendaTimezonePanel` + `useResolvedClinicTimezone` | `GET/PATCH /api/clinic/me`, `PUT /api/doctor-profile/me` | ✔ |
| 8 | UX Workspace | nav, collapsibles, badges, skeleton | Sin cambios BE | ✔ |
| 9 | Dashboard | KPIs READ ONLY sobre queries existentes | Sin APIs nuevas | ✔ |

---

## Checklist operacional QA

| Ítem | Resultado | Notas |
|------|-----------|-------|
| Availability | ✔ | Rules + slots desde SSOT |
| Rules CRUD | ✔ | Invalidación cruzada availability/waitlist |
| Slots | ✔ | Libre/ocupado en FE; motor slots en BE |
| Blocks | ✔ | Scope doctor/admin + `isActive` |
| Waitlist | ✔ | Matching slots; sin lógica paralela |
| Reminders | ✔ | Admin SSOT; sin envío real a proveedores |
| Timezone | ✔ | Clínica IANA + override doctor |
| Dashboard | ✔ | Solo agregación de presentación |
| Workspace UX | ✔ | 5 tabs; accesible tablist |
| Permisos DOCTOR/ADMIN | ✔ | Guards BE + UI condicionada |
| Clinic scope | ✔ | `getUserWithClinic` / tenant |
| Doctor scope | ✔ | `resolveDoctorId` / filtro admin |
| React Query | ✔ | Keys por dominio + invalidaciones |
| Loading / error | ✔ | Skeleton + estados de error en page/paneles |
| Responsive | ✔ | Layout panel existente |
| Accesibilidad | ✔ | Tablist / badges / labels (baseline) |

---

## Gates ejecutados (local)

| Gate | Comando | Resultado esperado |
|------|---------|-------------------|
| TypeScript | `npm run lint` (`tsc --noEmit`) | pass |
| Unit tests | `npm test` | pass |
| Build | `NEXT_PUBLIC_API_URL=… NEXT_PUBLIC_WS_URL=… npm run build` | pass |
| Backend | — | Sin cambios → sin commit BE |

---

## Hallazgos QA (no bloqueantes de certificación de rama)

| ID | Severidad | Hallazgo | Tratamiento |
|----|-----------|----------|-------------|
| QA-1 | Medio | Ocupación de slots se deriva en FE cruzando citas + slots BE | Documentado; sin lógica de negocio nueva en F10 |
| QA-2 | Medio | `refreshAll` usa `refetch()` directo para citas/availability (no invalidación por prefijo idéntica a timezone) | Aceptable; timezone panel invalida prefijos amplios |
| QA-3 | Baja | Comentario obsoleto en cliente availability (corregido en F10 docs/hardening) | Doc-only |
| QA-4 | Info | Reminders sin proveedor de envío real | Fuera de alcance F1–9; no es bug de panel |
| QA-5 | Info | Endpoints públicos confirm/cancel token fuera del panel | Dominio citas legacy; no parte del workspace Enterprise |

---

## Casos de prueba manuales recomendados (staging)

1. **Doctor:** crear regla → ver slots → bloquear franja → waitlist → política reminder → timezone override.
2. **Admin:** seleccionar doctor → CRUD rules/blocks → PATCH timezone clínica.
3. **Dashboard:** verificar KPIs coinciden con paneles Operations/Availability.
4. **DST preview:** clínica con zona IANA real; cambiar y refrescar vistas.
5. **Negativos:** admin sin doctor seleccionado no debe inventar availability; doctor no edita timezone clínica.

---

## Veredicto QA

**QA de producto en rama: PASS (certificado para consideración de merge).**  
**Deploy a producción: NO EJECUTADO / NO GO automático** (requiere checklist de release y aprobación explícita).
