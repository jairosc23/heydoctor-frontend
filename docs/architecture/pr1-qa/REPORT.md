# PR-1 Builder UX — QA funcional

Generado: 2026-08-08T17:18:10.623Z
URL: http://localhost:3000/qa/pr1-builder

## Resultados

- **[pass]** PrescriptionPanel dual-path Builder/Composer: flag + fallback legacy presentes
- **[pass]** Builder default ON: unset → true; opt-out 0/false/off
- **[pass]** Adapter legacy↔order lines presente: Orders persistence path intacto
- **[pass]** Harness /qa/pr1-builder carga: status=200
- **[pass]** Presentación: foco/click abre catálogo
- **[pass]** Presentación: catálogo completo: 17 opciones clínicas
- **[pass]** Presentación: filtro incremental: "pom" → 1 match(es)
- **[pass]** Presentación: flechas ↑↓: activa="Cápsula"
- **[pass]** Presentación: Enter selecciona: value="Cápsula"
- **[pass]** Presentación: Esc cierra
- **[pass]** Presentación: mouse selecciona: clicked≈"Tableta" value="Tableta"
- **[pass]** Frecuencia: foco/click abre catálogo: open≈8.6ms
- **[pass]** Frecuencia: apertura sin lag percibido: 8.6ms
- **[pass]** Frecuencia: catálogo completo: 18 opciones clínicas
- **[pass]** Frecuencia: filtro incremental: "8" → 2 match(es)
- **[pass]** Frecuencia: flechas ↑↓: activa="Cada 8 horas"
- **[pass]** Frecuencia: Enter selecciona: value="Cada 8 horas"
- **[pass]** Frecuencia: Esc cierra
- **[pass]** Frecuencia: mouse selecciona: clicked≈"Cada 6 horas" value="Cada 6 horas"
- **[pass]** Duración: foco/click abre catálogo: open≈10.3ms
- **[pass]** Duración: apertura sin lag percibido: 10.3ms
- **[pass]** Duración: catálogo completo: 13 opciones clínicas
- **[pass]** Duración: filtro incremental: "mes" → 3 match(es)
- **[pass]** Duración: flechas ↑↓: activa="7 días"
- **[pass]** Duración: Enter selecciona: value="7 días"
- **[pass]** Duración: Esc cierra
- **[pass]** Duración: mouse selecciona: clicked≈"5 días" value="5 días"
- **[pass]** Vía: foco/click abre catálogo: open≈10.3ms
- **[pass]** Vía: apertura sin lag percibido: 10.3ms
- **[pass]** Vía: catálogo completo: 12 opciones clínicas
- **[pass]** Vía: filtro incremental: "oral" → 1 match(es)
- **[pass]** Vía: flechas ↑↓: activa="Intramuscular"
- **[pass]** Vía: Enter selecciona: value="Intramuscular"
- **[pass]** Vía: Esc cierra
- **[pass]** Vía: mouse selecciona: clicked≈"Sublingual" value="Sublingual"
- **[pass]** Preview sin texto ambiguo: ORDEN CLÍNICA | MEDICAMENTO | Paracetamol 500 mg | PRESENTACIÓN | Comprimido · 500 mg | DOSIS | 1 comprimido | FRECUENCIA | Cada 8 horas | DURACIÓN | 7 días | VÍA | Oral
- **[pass]** Preview bloques clínicos claros: medicamento, presentación, dosis, frecuencia, duración, vía
- **[pass]** Preview en bloques semánticos (no frase ambigua)
- **[pass]** Secuencia autocomplete Presentación: frames seq-01..05; filtrado=["Seleccionar presentación…","Comprimido"]
- **[pass]** Video corto autocomplete+teclado: autocomplete-keyboard.webm
- **[pass]** Responsive desktop (1440×900): sin overflow-x
- **[pass]** Responsive laptop (1280×800): sin overflow-x
- **[pass]** Responsive tablet (768×1024): sin overflow-x
- **[minor]** Warnings/errores de consola: [error] [REFRESH] refresh threw (non-timeout) {error: Falta NEXT_PUBLIC_HEYDOCTOR_API_URL. Defínela en el build (p. ej. https://pro-api.heydoctor.health).}
[warning] [AUTH] bootstrap refresh failed; clearing local session {phase: bootstrap, step: refresh, error: Falta NEXT_PUBLIC_HEYDOCTOR_API_URL. Defínela en el build (p. ej. https://pro-api.heydoctor.health).}
[pageerror] Falta NEXT_PUBLIC_HEYDOCTOR_API_URL. Defínela en el build (p. ej. https://pro-api.heydoctor.health).
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Refused to execute script from 'http://localhost:3000/_vercel/insights/script.js' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.
[error] [REFRESH] refresh threw (non-timeout) {error: Falta NEXT_PUBLIC_HEYDOCTOR_API_URL. Defínela en el build (p. ej. https://pro-api.heydoctor.health).}
[warning] [AUTH] bootstrap refresh failed; clearing local session {phase: bootstrap, step: refresh, error: Falta NEXT_PUBLIC_HEYDOCTOR_API_URL. Defínela en el build (p. ej. https://pro-api.heydoctor.health).}
[pageerror] Falta NEXT_PUBLIC_HEYDOCTOR_API_URL. Defínela en el build (p. ej. https://pro-api.heydoctor.health).
[error] Failed to load resource: the server responded with a status of 404 (Not Found)
[error] Refused to execute script from 'http://localhost:3000/_vercel/insights/script.js' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.

## Artefactos

- `REPORT.md`
- `autocomplete-keyboard.webm`
- `duración-catalog-open.png`
- `duración-keyboard-nav.png`
- `duración-typeahead.png`
- `frecuencia-catalog-open.png`
- `frecuencia-keyboard-nav.png`
- `frecuencia-typeahead.png`
- `presentación-catalog-open.png`
- `presentación-keyboard-nav.png`
- `presentación-typeahead.png`
- `preview-orden-clinica.png`
- `responsive-desktop.png`
- `responsive-laptop.png`
- `responsive-tablet.png`
- `seq-01-focus-open.png`
- `seq-02-type-com.png`
- `seq-03-type-compri.png`
- `seq-04-arrow.png`
- `seq-05-enter.png`
- `vía-catalog-open.png`
- `vía-keyboard-nav.png`
- `vía-typeahead.png`