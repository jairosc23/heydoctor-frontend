# Wave-4 Theme 2 M3 — Interop FE harness

| Field | Value |
|-------|-------|
| Branch | `wave-4/interop-production` |
| Base | `main` |
| Status | **M3 complete — awaiting review before M4** |
| Route | `/dev/w3-interop` (dev-only; no production nav) |

## Delivered

- `/dev/w3-interop` calls `POST /api/w3/interop/workspace/open`
- `mapInteropOpenToHarness` maps durable payload; forces `ownsCos: false`
- Surfaces workspace id, persisted flag, quarantine/export status lists
- `NEXT_PUBLIC_W3_INTEROP` default OFF; fail-closed on BE 403
- Vitest + node:test coverage for mapper / flag / 403

## Not in M3

- Production navigation
- Partner integrations / write-back
- UAT / flag activation / release
