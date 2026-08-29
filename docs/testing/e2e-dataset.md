# Dataset E2E oficial — R1

**Type:** registro de dataset QA (no se reutilizan históricos de otras clínicas)  
**Frozen:** sí — no modificar este dataset ni los Repository Secrets de consulta salvo incidente autorizado  
**Source run:** [CI 33224895758](https://github.com/jairosc23/heydoctor-frontend/actions/runs/33224895758)  
**SHA-FE-LTS:** `db4bdbf379b7e891dccbb36b30b0255d8523fb9d`

---

## Clínica y actores

| Campo | Valor |
|-------|--------|
| Clínica | `6fc0daad-a777-405c-ae37-b30394bed43a` |
| Médico E2E (email) | `e2e.ci.doctor@heydoctor.local` |
| Médico E2E (`doctorId`) | `46b855af-88f1-48dd-be2c-e30872b8ed47` |
| Secret email | `E2E_DOCTOR_EMAIL` |
| Secret password | `E2E_DOCTOR_PASSWORD` (no se documenta el valor) |
| Paciente E2E | `E2E Paciente Seed` |
| Paciente email | `e2e.ci.patient@heydoctor.local` |
| Paciente id | `a739d9b0-3da9-4eff-849b-e58bd91835de` |

Los cuatro UUIDs de consulta pertenecen a la misma `clinicId` y al mismo `doctorId`.

---

## Consultas oficiales

| Secret | UUID | CIE-10 | Rol P0 |
|--------|------|--------|--------|
| `E2E_CONSULTATION_HTA` | `3223d8a1-ec78-4945-9110-c2cd9e6e579a` | I10 | P0-0, P0-1, observability smoke |
| `E2E_CONSULTATION_DM2` | `63066cad-fd40-4dba-bc7c-33ff99c6ae3e` | E11.9 | P0-2 |
| `E2E_CONSULTATION_ACUTE` | `67d331e9-9649-4b30-9cdb-50bfb1b77e58` | R51 | P0-3 |
| `E2E_CONSULTATION_PAYMENT` | `f18e5767-65e9-4c6d-990e-747938756f18` | I10 | P0-4 (estado inicial certificado: `signed`) |

No reutilizar datasets históricos de clínica `e9ac6b5a-6191-4a0c-b4cb-5af014dd6ee2`.

---

## Criterios de aceptación del dataset

- `GET` 200 para los cuatro UUID con el médico CI.
- Misma `clinicId` y mismo `doctorId`.
- Secrets de consulta: solo valores; **no** cambiar nombres.
- `E2E_DOCTOR_EMAIL` / `E2E_DOCTOR_PASSWORD` no se rotan en este registro.
- Suite P0 + F2-01 PASS en el workflow certificado.

Este dataset queda congelado con R1.
