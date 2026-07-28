# HCX Clinical Communication System v1.0  
## Official Communication Language of HeyDoctor

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 5 — Clinical Communication System |
| **Document** | HCX Clinical Communication System |
| **Version** | 1.0 |
| **Status** | Official — **no implementation** |
| **Consumes** | Vision · Foundations · Tokens · Patterns · Blueprints · Surface Recipes · Wireframe Contracts |
| **Path** | `docs/design/hcx/HCX-CLINICAL-COMMUNICATION-SYSTEM-v1.0.md` |
| **Brand accent** | `#078A92` (structural teal — wordmark, primary CTA, focus, HAB accent) |

**Laws:** Spec only · no React · no CSS · no Tailwind · no code · no commits.  
**Separation:** HCX owns experience language. COS owns behavior. Copy never invents a second authority.

---

## 1. Purpose

Define the **official clinical communication language** of HeyDoctor so every surface speaks with one calm, clear, continuous voice — and so microcopy never collapses:

**Dispose ≠ Confirm ≠ Emit**

Beauty never competes with clinical truth.

---

## 2. Tone of voice

| Attribute | Directive |
|-----------|-----------|
| **Calm** | Steady, unhurried; no alarmist marketing tone in clinical work |
| **Clear** | One idea per sentence; prefer plain Spanish clinical language |
| **Continuous** | Same verbs across surfaces; no synonym roulette for authority acts |
| **Respectful** | Address clinicians as professionals; patients as people, never cases alone |
| **Non-authoritative AI** | AI is peripheral assistance — never the voice of clinical decision |
| **Honest** | Never imply success, connection, or authorization that is not true |

**Avoid:** hype, emoji as meaning, neon urgency, purple “AI magic,” false reassurance, jargon stacks without plain gloss.

---

## 3. Microcopy principles

1. **One verb, one meaning.** Do not reuse Confirm/Approve/Emit for AI dispose.
2. **Lead with what matters.** Act → identity → consequence → action.
3. **Name the actor.** “Usted confirma” (human) vs “Sugerencia del asistente” (AI).
4. **Fail closed in words.** If blocked, say what is blocked and how to recover.
5. **Color is not meaning.** Critical states must be textual + announced.
6. **Short by default.** Title ≤ 6 words; body ≤ 2 short sentences unless HAB challenge.
7. **Locale-coherent.** UI locale matches copy language; do not mix ES/EN in one challenge.
8. **No fake clinical conclusions.** Empty ≠ “sin hallazgos clínicos autorizados.”

---

## 4. Clinical terminology (canonical lexicon)

| Concept | Preferred (ES) | Forbidden near-synonyms in authority contexts |
|---------|----------------|-----------------------------------------------|
| Clinical suggestion (AI) | **Sugerencia** / **Propuesta** | Orden, indicación firmada, confirmación |
| Accept AI into draft | **Aceptar en borrador** / **Usar sugerencia** | Confirmar, Aprobar, Firmar, Emitir |
| Discard AI | **Descartar** / **Ignorar sugerencia** | Rechazar (reserve Reject for HAB) |
| Refine AI | **Refinar** | Modificar (reserve Modify for HAB) |
| Human authority confirm | **Confirmar** | Aprobar (ambiguous), OK, Continuar |
| Human authority reject | **Rechazar** | Cancelar (too weak for HAB), Descartar |
| Human authority modify | **Modificar** | Editar borrador (non-HAB) |
| Human authority abort | **Abortar** | Cerrar, Salir (non-specific) |
| Medication emission | **Emitir** | Enviar, Confirmar y emitir (fused phrase banned) |
| Acknowledge notification | **Acusar recibo** | Confirmar |
| Bound context | **Contexto vinculado** | Sesión activa (too vague alone) |
| Unbound / fail-closed | **Contexto no vinculado** / **Acción bloqueada** | Error genérico sin causa |

---

## 5. AI language

| Situation | Pattern |
|-----------|---------|
| Label | Always prefix or badge: **Sugerencia** (provisional) |
| Body | Neutral clinical draft language; cite “por qué” when evidence exists |
| Streaming | Do not flood screen readers; announce completion, not every token |
| Confidence | Prefer qualitative (“basado en notas del encuentro”) over fake % |
| Failure | Amber, honest: “El asistente no está disponible. Puede continuar de forma manual.” |
| Degraded | “Asistencia limitada.” Never claim full Copilot if CAP-033 degraded |

**AI must never say:** “He confirmado,” “Prescripción emitida,” “Autorizado,” “Orden enviada.”

**AI may say:** “Propongo,” “Sugiero revisar,” “Borrador listo para su disposición.”

### Dispose action labels (AI Dock)

| Kind | Label (ES) | Must not read as |
|------|------------|------------------|
| dispose_accept | **Aceptar en borrador** | Confirmar / Emitir |
| dispose_reject | **Descartar sugerencia** | Rechazar (HAB) |
| dispose_refine | **Refinar sugerencia** | Modificar (HAB) |
| dispose_ignore | **Ignorar** | Abortar (HAB) |

---

## 6. Human Authority language

| Element | Copy contract |
|---------|---------------|
| Surface title | **Confirmación de autoridad** |
| Sequence | Acto clínico → Paciente / encuentro → Consecuencias → Acciones HAB → Estado de contexto |
| Primary actions | **Confirmar** · **Rechazar** · **Modificar** · **Abortar** |
| Confirm helper | “Confirmar registra su autoridad. No emite automáticamente.” |
| Unbound | “No puede confirmar: el contexto clínico no está vinculado.” + recovery CTA |
| Success of Confirm | “Autoridad registrada.” (not “Emitido”) |
| Staff | If staff lacks authority: “Esta acción requiere al médico responsable.” |

**Forbidden in HAB:** Dispose controls, Copilot stream, “Confirmar y emitir,” celebratory success copy.

---

## 7. Prescription language

| State | Language |
|-------|----------|
| Draft | “Borrador de prescripción” |
| Ready for HAB | “Lista para confirmación de autoridad” |
| Authority confirmed | “Autoridad confirmada — pendiente de emisión” |
| Emitted | “Prescripción emitida” (only after real emit) |
| Failed emit | “No se pudo emitir. La autoridad registrada no se revierte automáticamente.” |

**Banned fused CTA:** “Confirmar y emitir.”  
**Split CTAs:** Confirmar (HAB) · Emitir (post-HAB / PE).

---

## 8. Order language

| State | Language |
|-------|----------|
| Draft order | “Orden en borrador” |
| Pending authority | “Requiere confirmación” |
| Placed | “Orden registrada” / product-specific placed term |
| Cancelled | “Orden cancelada” |
| AI-suggested order | “Sugerencia de orden” + Dispose lexicon only |

Orders never inherit Confirm verbs from notifications or AI dock.

---

## 9. Alert language

| Severity | Title pattern | Body | Ack |
|----------|---------------|------|-----|
| Info | Factual noun phrase | One sentence next step | Optional Acusar recibo |
| Warning | Risk without panic | What to check | Acusar recibo |
| Critical | Direct clinical risk | What is blocked + what to do | Must acknowledge; **not** toast-only |
| System | Connectivity / session | Recovery path | Reconectar / Iniciar sesión |

**Rule:** Critical uses alert + live region. Toast alone is forbidden for critical.

---

## 10. Error language

Pattern: **Qué falló → Por qué (simple) → Qué hacer**

| Example | Copy |
|---------|------|
| Network | “No pudimos guardar. Compruebe la conexión e intente de nuevo.” |
| Permission | “No tiene permiso para esta acción.” |
| Unbound | “Acción bloqueada: contexto clínico no vinculado.” |
| Validation | Name the field; keep clinician text if safe |
| Unknown | “Algo salió mal. Puede reintentar o contactar soporte.” |

**Forbidden:** infinite spinner as only feedback; false success; blaming the clinician.

---

## 11. Success language

| Context | Copy |
|---------|------|
| Draft saved | “Borrador guardado” |
| Dispose accepted | “Sugerencia aceptada en borrador” |
| HAB confirm | “Autoridad registrada” |
| Emit | “Emitida” only when emission succeeded |
| Reconnected | “De nuevo en línea” (optional, brief) |

Success must match the real system event. Never upgrade Dispose to Confirm in success toasts.

---

## 12. Empty states

Pattern: **Título honesto → Una frase → Una CTA**

| Surface | Example title | Body | CTA |
|---------|---------------|------|-----|
| Timeline | “Sin eventos aún” | “Los eventos del encuentro aparecerán aquí.” | Continuar documentación |
| Orders | “Sin órdenes” | “Cree una orden o revise sugerencias.” | Nueva orden |
| Notifications | “Bandeja vacía” | “No hay avisos pendientes.” | — |
| Search | “Sin resultados” | “Pruebe otro término.” | Limpiar búsqueda |
| AI Dock | “Sin sugerencias” | “El asistente no tiene propuestas ahora.” | Documentar manualmente |

Empty ≠ Error ≠ Offline. Never invent clinical findings from emptiness.

---

## 13. Loading states

| Context | Language |
|---------|----------|
| Generic | “Cargando…” |
| Assist | “Generando sugerencia…” (not “Pensando la indicación”) |
| HAB submit | “Registrando autoridad…” |
| Emit | “Emitiendo…” |
| Rebind | “Restableciendo contexto…” |

Prefer determinate progress when duration is known; otherwise calm indeterminate. Do not imply completion while loading.

---

## 14. Consent language

| Principle | Directive |
|-----------|-----------|
| Plain | Explain purpose, data use, and choice without legalese walls in the primary view |
| Separate | Consent ≠ HAB Confirm ≠ Emit |
| Affirmative | “Acepto” / “No acepto” — never pre-checked clinical consent |
| Withdrawal | State how to withdraw when product supports it |
| AI | If AI uses clinical text: disclose assistance; never hide Copilot as silent author |

---

## 15. Accessibility language

| Requirement | Copy / SR behavior |
|-------------|-------------------|
| AI content | Announce as “Sugerencia del asistente” |
| HAB open | Assertive: purpose of Confirmación de autoridad |
| HAB result | Announce Confirm/Reject/Modify/Abort outcome |
| Critical / offline | Live region; do not rely on color |
| Fail-closed | State blocked action + recovery |
| Locale | SR strings match UI locale |
| Icons | Decorative icons have empty alt; meaning in text |

---

## 16. Localization strategy

| Rule | Detail |
|------|--------|
| Source locale | Spanish (clinical product default for this system) |
| Keying | Semantic keys by surface + intent (`hab.confirm.label`), not by English sentence |
| Authority verbs | Locked glossary — translators must not “improve” Confirm into Approve |
| Length | Allow ~30% expansion; HAB buttons remain full words (no “OK”) |
| Mixed locale | Forbidden inside a single HAB challenge or prescription review |
| Medical terms | Prefer nationally understood clinical Spanish; gloss rare abbreviations once |

---

## 17. Writing guidelines (checklist)

Authors of any HeyDoctor clinical string SHALL:

- [ ] Use canonical lexicon (§4) for Dispose / Confirm / Emit  
- [ ] Label AI as sugerencia when AI-authored  
- [ ] Keep HAB title **Confirmación de autoridad**  
- [ ] Split Confirm and Emit CTAs  
- [ ] Provide recovery on errors and unbound states  
- [ ] Separate Empty / Error / Offline copy  
- [ ] Ensure text remains meaningful without color  
- [ ] Avoid fused legacy phrases (“Confirmar y emitir”, “Aprobar paquete” as HAB)  
- [ ] Prefer one CTA primary; secondary quieter  
- [ ] Never let notification Ack imply clinical Confirm  

---

## 18. Relation to HCX surfaces & patterns

| Surface / Pattern | Communication duty |
|-------------------|--------------------|
| AI Dock | Dispose lexicon only |
| Human Authority Zone | HAB lexicon only |
| Prescription Review | Split Confirm vs Emit language |
| Orders | Draft vs authority vs placed |
| Notification | Ack ≠ Confirm; severity language |
| Empty / Error / Offline | Honest state language (§§10–13) |
| Telemedicine | Never false “conectado” |
| Dashboard | Non-authority chrome language |

Wireframe stacking still applies: assist copy never visually or verbally overrides an open HAB challenge.

---

## 19. Relation to COS (consume only)

| COS concept | HCX language obligation |
|-------------|-------------------------|
| E02 disposition | Dispose labels; never Confirm/Emit |
| E04 HAB | Confirmación de autoridad + four verbs |
| E05 unbound | Bloqueo + recovery; no silent continue |
| E03 journey | Journey chrome narrates stage; does not claim authority |
| E11 emit (future) | “Emitir” only after real emission path |

HCX does **not** redefine COS behavior.

---

## 20. Recommended next phase

**HCX Phase 6 — Content & Microcopy Matrix (surface × role × severity × state)**  
Operational spreadsheet/tables binding this Communication System to every Surface Recipe string slot (including SR names), ready for implementation without inventing new semantics.

---

## 21. Document control

| Field | Value |
|-------|-------|
| Supersedes | Informal “Content & Microcopy Matrix” placeholder naming from Phase 4 recs (this doc is the language system; matrix follows) |
| Implementation | **None** |
| Commits required | **None** |

**End of HCX Clinical Communication System v1.0.**
