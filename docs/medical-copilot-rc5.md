# Medical Copilot RC5 — Production Readiness

> Branch: `release/medical-copilot-v1.0-rc2`
> Focus: Release Candidate validation (no SSOT expansion, no deploy)

## Production Readiness

RC5 hardens operational infrastructure on top of RC3/RC4:

- Resilience: timeouts, cancellation, duplicate-retry protection, internal circuit
- Observability: P50/P95/P99, cache effectiveness, concurrency
- Contract drift detection (fails on breaking changes)
- Read-only production diagnostics
- Release checklist (no deploy)

## Operational Guide

1. Keep working branch `release/medical-copilot-v1.0-rc2`
2. Run BE: format → lint → build → test
3. Run FE: lint → build → test → Playwright crítico
4. Review `docs/medical-copilot-rc5-diagnostics.json`
5. Review `docs/medical-copilot-rc5-release-checklist.json`
6. Do **not** merge to main / deploy from this checklist alone

## Performance Guide

| Signal | Source |
|---|---|
| Builder latency percentiles | RC5 observability (miss durations) |
| Request latency percentiles | RC5 request duration ring buffer |
| Cache hit ratio / effectiveness | RC4/RC5 metrics |
| FE package resolution | `medicalCopilotGet` timing |
| FE lazy hydration | DeferredPanel virtualization |

## Troubleshooting

| Symptom | Check |
|---|---|
| Timeouts in logs | `Rc5TimeoutError` / FE `Rc5FeTimeoutError` |
| Circuit open | repeated builder failures → cooldown |
| Drift test fail | removed endpoint/governance/package key |
| High fan-out | ensure RC3 memo + RC4 isolation active |

## Catalogs

- `medical-copilot-ssot-catalog-rc3.md` — Package/Endpoint/Panel inventory
- `medical-copilot-rc4.md` — Hardening layer
- `medical-copilot-rc5-diagnostics.json` — structural diagnostics
- `medical-copilot-rc5-release-checklist.json` — promotion gates
- `src/ai/rc5-operational/rc5-contract-baseline.json` — contract baseline

### Package / Endpoint / Workflow / Orchestrator Catalogs

Frozen SSOT under `src/ai/governed-*`. RC5 does not add packages, endpoints, workflows, or orchestrators.
