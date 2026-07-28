## Resumen

<!-- Qué cambia y por qué (W1 / evolutionary trunk) -->

| Field | Value |
|-------|-------|
| **Wave** | W1 |
| **Backlog ID** | <!-- e.g. W1-FE-002 --> |
| **EDP** | <!-- E01–E05 --> |
| **CAP** | <!-- Canonical ID from Capability Identity Addendum --> |

## Architecture Compliance Checklist

Mirror of backend `docs/implementation/ARCHITECTURE-COMPLIANCE-CHECKLIST-v1.0.md` (program of record in `heydoctor-backend-pro`).  
Any **Critical FAIL** blocks merge.

### W1 Critical invariants (always)

- [ ] Dispose ≠ Confirm (UX must not collapse HAB into Accept)
- [ ] Copilot panel has no Confirm/Emit controls
- [ ] Unbound clinical context → assist surfaces blocked (banner + no activate)
- [ ] FE does not sole-source clinical authority rules
- [ ] No flag that disables HAB or context fail-closed
- [ ] No parallel mini-COS shell
- [ ] Capability ID matches Addendum

### Checklist result

| Result | Sections covered | Evidence (tests / links) |
|--------|------------------|--------------------------|
| PASS / FAIL / N/A | | |

## Engineering Checklist

- [ ] Rama actualizada respecto a `cos/w1-foundation` o trunk acordado.
- [ ] CI en verde.
- [ ] No push directo a `main`.
- [ ] Fuera de alcance W1 no implementado.
- [ ] Backward compatibility preservada o documentada.

## Notas

<!-- Flags, riesgos, deferred debts -->
