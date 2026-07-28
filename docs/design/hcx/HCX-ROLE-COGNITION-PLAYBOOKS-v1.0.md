# HCX Role Cognition Playbooks v1.0  
## How Each Role Thinks, Decides, and Interacts

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 7 — Role Cognition Playbooks |
| **Document** | HCX Role Cognition Playbooks |
| **Version** | 1.0 |
| **Status** | Official — **no implementation · no UI · no code** |
| **Consumes** | Clinical Cognition · Communication System · Blueprints · Surface Recipes · Patterns |
| **Path** | `docs/design/hcx/HCX-ROLE-COGNITION-PLAYBOOKS-v1.0.md` |

**Laws:** Spec only · no React · no CSS · no commits.  
**Separation:** Playbooks describe experience cognition per role. COS owns rights and authority. AI never becomes authority for any role.

**Universal cognitive law:** Dispose ≠ Confirm ≠ Emit · Ack ≠ Confirm · Book ≠ Confirm · Join ≠ Confirm.

---

## 0. Shared frame

| Dimension | All roles |
|-----------|-----------|
| Brand cognition | Calm, clear, continuous; teal `#078A92` structural |
| Fail-closed language | Blocked acts explain cause + recovery |
| Cross-role rule | No role’s UX may invent HAB substitution |
| Multi-device | Same decision hierarchy; density adapts, verbs do not |

Each playbook uses:

Goals · Cognitive Journey · Primary Decisions · Secondary Decisions · Interruptions · AI Interaction · Human Authority Interaction · Accessibility · Clinical Safety · Error Recovery · Multi-device Behaviour · Cross-role Collaboration

---

# Playbook 1 — Physician

## Goals
- Deliver safe, continuous care in the encounter  
- Document truthfully; compose therapy/orders when needed  
- Exercise Human Authority on irreversible acts  
- Use AI as peripheral assistance, never as decision owner  

## Cognitive Journey
1. Orient (identity, context bound, agenda/encounter)  
2. Explore (timeline, priors inform-only)  
3. Assist optional (suggestions → Dispose)  
4. Document / compose (draft → ready)  
5. Authority (HAB Confirm/Reject/Modify/Abort)  
6. Execute owned path / emit (post-HAB)  
7. Complete / handoff  

## Primary Decisions
- Confirm / Reject / Modify / Abort (HAB)  
- Emit only after Confirm (when emission exists)  
- Sign / finalize documentation when irreversible  

## Secondary Decisions
- Accept/Discard/Refine/Ignore AI suggestions (Dispose)  
- Ready a plan (≠ Confirm)  
- Ack notifications; navigate; search  

## Interruptions
| Class | Response |
|-------|----------|
| Unbound / offline | Freeze irreversible; rebind/reconnect |
| Critical alert | Full attention; pause AI prominence |
| HAB open | Trap focus; disable Dispose controls |
| Soft AI | Yield to typing; never modal spam |

## AI Interaction
- Peripheral dock/sheet; labeled **Sugerencia**  
- Dispose only; never Confirm/Emit language  
- Degraded assist: manual path intact  

## Human Authority Interaction
- Full-attention HAB zone  
- Copy: Confirmación de autoridad  
- Confirm does not auto-emit  

## Accessibility
- Assertive HAB and critical announces  
- One primary CTA; large recovery controls  
- Color never sole meaning  

## Clinical Safety
- Context health always glanceable  
- No fused Confirm+Emit  
- Preserve clinician text on soft errors  

## Error Recovery
- Qué falló → por qué → qué hacer  
- Preserve drafts; retry without false success  

## Multi-device Behaviour
- xl: dock + timeline rail + HAB band/modal  
- sm: assist sheet; HAB full-screen; sticky offline  

## Cross-role Collaboration
- Receives staff messages as non-HAB  
- Patient portal never shows pre-emit as legal Rx  
- Admin policy cannot appear as “disable HAB”  

---

# Playbook 2 — Patient

## Goals
- Understand appointments, documents, and post-emission deliverables  
- Act on clear next steps without clinical jargon overload  
- Protect privacy and consent choices  

## Cognitive Journey
1. Arrive (trust, identity)  
2. Orient (Inicio · Citas · Documentos · Mensajes · Perfil)  
3. Act (book/view/message/consent)  
4. Receive (emission-first documents when available)  
5. Follow up  

## Primary Decisions
- Confirm attendance / booking choices (≠ clinical Confirm)  
- Consent accept/decline  
- Open messages; download allowed documents  

## Secondary Decisions
- Profile updates; notification preferences  
- Ack informational notices  

## Interruptions
| Class | Response |
|-------|----------|
| Session expiry | Calm re-auth; no clinical authority UI |
| Critical privacy/security | Clear stop + support path |
| Soft tips | Dismissible; never block care access |

## AI Interaction
- If present: plain-language help only  
- Never clinical Confirm/Emit  
- Never impersonate the physician  

## Human Authority Interaction
- **None** for clinical HAB  
- May *view* results of physician authority (post-emission)  
- Copy never says the patient “confirmed the prescription”  

## Accessibility
- Plain language; large tap targets  
- SR-friendly navigation landmarks  
- Avoid dense clinical abbreviations without gloss  

## Clinical Safety
- Pre-emit content hidden or clearly non-final  
- No editable clinical masters  
- Emergency: direct to real-world care instructions when product policy requires  

## Error Recovery
- Friendly retry; support contact  
- Never imply a clinical order was placed by the patient  

## Multi-device Behaviour
- Mobile-first portal density  
- Documents readable offline-cached only if product allows; never fake “signed by you”  

## Cross-role Collaboration
- Messages to clinic/staff are requests, not orders  
- Physician remains sole clinical authority  

---

# Playbook 3 — Staff

## Goals
- Keep clinic operations flowing (queues, agenda, messaging)  
- Support physicians without substituting clinical authority  
- Route work that requires physician HAB explicitly  

## Cognitive Journey
1. Shift start (site/clinic, role, queue)  
2. Triage queue / agenda  
3. Coordinate patients and messages  
4. Escalate acts that require physician  
5. Close loop (ack, handoff notes — non-HAB)  

## Primary Decisions
- Queue prioritization; booking/check-in (Book ≠ Confirm)  
- Escalate “requires physician”  
- Ack operational notifications  

## Secondary Decisions
- Filters; templates; nonclinical notes  
- Suppress low-priority channels  

## Interruptions
| Class | Response |
|-------|----------|
| Critical clinic ops | Banner + queue freeze if needed |
| Physician HAB elsewhere | Staff UI must not offer Confirm |
| Soft AI ops tips | Optional; never clinical dispose-as-approve |

## AI Interaction
- Ops assistance only (scheduling hints, message drafts)  
- Explicit: **no clinical Confirm**  
- Suggestions labeled non-authoritative  

## Human Authority Interaction
- **Reserved to physician**  
- Staff see “Requiere médico” when authority needed  
- No HAB mount for staff clinical acts  

## Accessibility
- Dense tables still AA; keyboard queue ops  
- Clear escalation affordances  

## Clinical Safety
- Never present staff “approve” as HAB  
- PHI minimization in queues  
- No emit controls  

## Error Recovery
- Restore queue position; explain permission denials plainly  

## Multi-device Behaviour
- Desktop-dense ops; tablet acceptable  
- HAB absence must remain obvious on all sizes  

## Cross-role Collaboration
- Hand off to physician with context, not authority  
- Patient messages routed without inventing clinical decisions  

---

# Playbook 4 — Administrator

## Goals
- Configure clinic operations, users, and policies safely  
- Observe system health without rewriting clinical truth  
- Ensure settings never look like “turn off HAB/PE”  

## Cognitive Journey
1. Enter admin chrome (clinic scope clear)  
2. Choose configuration domain (users, hours, integrations flags)  
3. Preview impact  
4. Apply change with confirmation of *admin* action (≠ HAB)  
5. Audit/review  

## Primary Decisions
- User/role assignments within policy  
- Clinic configuration changes  
- Enable/disable non-authority features  

## Secondary Decisions
- Report filters; export operational (non-PHI abuse controls)  

## Interruptions
| Class | Response |
|-------|----------|
| Security alert | Freeze risky config; force re-auth |
| Clinical emergency elsewhere | Admin must not interrupt physician HAB visually as “override” |

## AI Interaction
- Config assistants optional; never clinical authority  
- No “auto-approve prescriptions” affordances  

## Human Authority Interaction
- Admin confirmation ≠ Human Authority Confirm  
- Distinct lexicon: “Guardar configuración” / “Aplicar cambio”  
- Cannot Confirm clinical acts  

## Accessibility
- Forms with clear labels; error per field  
- Dangerous actions require explicit typed confirm when policy says so  

## Clinical Safety
- Policy packs cannot disable HAB/PE in UX copy or controls  
- Separation of admin vs clinical workspaces  

## Error Recovery
- Transactional config rollback messaging  
- Never silent partial clinical impact  

## Multi-device Behaviour
- Prefer desktop for complex config  
- Mobile: read-only status + emergency contacts  

## Cross-role Collaboration
- Provisions staff/physicians  
- Enterprise admin may constrain clinics without patient-level HAB  

---

# Playbook 5 — Enterprise

## Goals
- See portfolio health across org → site → clinic  
- Navigate into clinic workspaces without flattening authority  
- Enforce topology boundaries cognitively (right scope, right act)  

## Cognitive Journey
1. Portfolio overview (org)  
2. Select site/clinic (explicit scope change)  
3. Embed or drill into clinic role workspace (Physician/Staff/Admin as permitted)  
4. Return to portfolio without leaking patient context  

## Primary Decisions
- Scope selection (org/site/clinic)  
- Cross-site comparison filters  
- Drill-down into a clinic workspace  

## Secondary Decisions
- Portfolio alerts ack (Ack ≠ Confirm)  
- Export aggregate non-PHI metrics when allowed  

## Interruptions
| Class | Response |
|-------|----------|
| Cross-tenant deny | Hard stop; explain scope |
| Clinic critical | Deep-link with consent to enter clinic context |
| Soft portfolio tips | Nonblocking |

## AI Interaction
- Portfolio insights advisory only  
- Never org-level clinical Confirm/Emit  
- Distinct from physician Copilot  

## Human Authority Interaction
- **No org-level HAB for patient acts**  
- Clinical HAB only after drill-in as Physician in clinic context  
- Copy must not say “enterprise approved the Rx”  

## Accessibility
- Clear scope breadcrumbs announced  
- High-level charts always have textual summary  

## Clinical Safety
- Fail-closed cross-org/site  
- PHI isolation in portfolio views  
- Embedded clinic inherits Physician safety rules  

## Error Recovery
- Scope mismatch → return to last safe portfolio node  
- No partial patient list across tenants  

## Multi-device Behaviour
- Desktop for portfolio; tablet for review  
- Mobile: alerts + drill reminders, not full HAB  

## Cross-role Collaboration
- Enterprise viewers vs clinic actors distinguished  
- Collaboration is scope navigation + policy, not shared Confirm  

---

## Cross-playbook matrix (quick)

| Concern | Physician | Patient | Staff | Admin | Enterprise |
|---------|-----------|---------|-------|-------|------------|
| HAB Confirm | Yes | No | No | No | Only if drilled-in as Physician |
| Dispose AI clinical | Yes | No | No clinical | No | No |
| Emit | Post-HAB | View post-emission | No | No | No |
| Book/Ack | Secondary | Primary (nonclinical) | Primary ops | Config confirm | Scope ack |
| Fail-closed unbound | Critical | N/A clinical | Escalate | N/A | Scope deny |

---

## Relation to COS

| COS | Playbook obligation |
|-----|---------------------|
| E04 HAB | Physician full attention; others denied |
| E02 Copilot | Physician Dispose only |
| E11 Emit (future) | Physician post-HAB; patient emission-first views |
| Tenancy | Enterprise/Staff/Admin respect topology |

HCX does not redefine COS rights.

---

## Recommended next phase

**HCX Phase 8 — Workflow Cognition Scripts** (step-level scripts for top clinical journeys per role) **or** Content & Microcopy Matrix if implementation handoff needs string slots first.

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| Commits required | **None** |

**End of HCX Role Cognition Playbooks v1.0.**
