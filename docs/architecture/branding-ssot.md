# Branding SSOT — Arquitectura oficial HeyDoctor

**Fase:** 18 (Branding SSOT)  
**Estado:** Cerrada  
**Alcance:** Frontend (`heydoctor-frontend`)

---

## Objetivo del Branding SSOT

Centralizar la identidad visual de HeyDoctor en un **único asset oficial** y un **flujo de resolución único**, de modo que:

- Todas las superficies de la aplicación muestren el mismo isotipo.
- No existan rutas alternativas, duplicados ni resoluciones ad hoc del logo.
- Las correcciones de marca se apliquen en un solo lugar y se propaguen automáticamente.
- La arquitectura permanezca estable y predecible para futuras contribuciones.

El Branding SSOT no es un sistema de theming genérico: es la **fuente de verdad congelada** del isotipo y su integración en la UI.

---

## Asset oficial del logo

| Elemento | Ruta | Descripción |
|---|---|---|
| **Isotipo maestro (SSOT)** | `public/brand/heydoctor-icon.svg` | Único archivo SVG autorizado para el isotipo HeyDoctor (burbuja + «Hey» + estetoscopio). |
| **Color corporativo** | `#078A92` (`primary` en Tailwind) | Verde oficial del isotipo y del wordmark. |
| **Fallback legacy** | `public/logo-heydoctor.png` | Solo se usa si el SVG no existe en disco (resolución en servidor). No es el asset de diseño. |

Reglas del asset (ver también `public/brand/README.md`):

- No reconstruir automáticamente desde PNG.
- No vectorizar con herramientas de IA.
- No duplicar ni renombrar el archivo oficial.
- No crear variantes paralelas del SVG (dark, mono, etc.) dentro de `public/brand/`.

---

## Flujo de resolución del logo

La resolución del isotipo sigue una cadena unidireccional, de servidor a cliente:

```
BrandLogo
  └─ useBrandMarkSrc()          ← hook (cliente)
       └─ BrandMarkProvider     ← contexto React (cliente)
            └─ markSrc          ← inyectado en app/layout.tsx
                 └─ getBrandMarkSrc()   ← función (servidor)
                      └─ public/brand/heydoctor-icon.svg
```

### 1. `getBrandMarkSrc()` — servidor

**Archivo:** `lib/brand-mark.server.ts`

- Se ejecuta en el **Root Layout** (`app/layout.tsx`) durante el render del servidor.
- Comprueba si `public/brand/heydoctor-icon.svg` existe en disco.
- Devuelve `/brand/heydoctor-icon.svg` si existe; en caso contrario, `/logo-heydoctor.png`.
- **No debe importarse en componentes cliente.**

### 2. `BrandMarkProvider` — cliente

**Archivo:** `components/branding/BrandMarkProvider.tsx`

- Recibe `markSrc` resuelto en el layout raíz.
- Expone el valor mediante React Context a todo el árbol de componentes.

### 3. `useBrandMarkSrc()` — cliente

**Archivo:** `components/branding/BrandMarkProvider.tsx`

- Hook que consume el contexto.
- Usado internamente por `BrandLogo` para obtener la URL del isotipo.
- **No usar directamente** para renderizar `<img>` en superficies de producto; usar siempre `BrandLogo`.

### 4. `BrandLogo` — componente de consumo

**Archivo:** `components/branding/BrandLogo.tsx`

- Punto de entrada **obligatorio** para mostrar el logo en la UI.
- Combina isotipo (`BrandMark`) y wordmark (`BrandWordmark`) según la variante.
- Lee `useBrandMarkSrc()`; nunca hardcodea rutas del asset.

### Constantes compartidas

**Archivo:** `lib/brand-mark.constants.ts`

- `BRAND_ICON_SVG`: ruta pública del SVG oficial.
- `BRAND_ICON_PNG`: fallback PNG.
- `isBrandMarkSvg()`: helper para `next/image` (`unoptimized` en SVG).

---

## Componentes relacionados

| Componente / módulo | Ubicación | Responsabilidad |
|---|---|---|
| `BrandLogo` | `components/branding/BrandLogo.tsx` | Renderizado unificado del logo (isotipo ± wordmark). |
| `BrandWordmark` | `components/branding/BrandWordmark.tsx` | Tipografía «HeyDoctor» por variante (`nav`, `landing`, `footer`, `enterprise`). |
| `BrandMarkProvider` | `components/branding/BrandMarkProvider.tsx` | Contexto con la URL del isotipo. |
| `useBrandMarkSrc` | `components/branding/BrandMarkProvider.tsx` | Hook de acceso al contexto. |
| `getBrandMarkSrc` | `lib/brand-mark.server.ts` | Resolución server-side del asset. |
| Constantes | `lib/brand-mark.constants.ts` | Rutas y utilidades del mark. |
| Barrel export | `components/branding/index.ts` | API pública de branding. |
| Root wiring | `app/layout.tsx` | Inyecta `BrandMarkProvider` en toda la app. |

### Variantes de `BrandLogo`

| Variante | Isotipo (px) | Wordmark | Uso típico |
|---|---|---|---|
| `nav` | 36 | «Hey» + «Doctor» (18 px) | Headers, navegación |
| `landing` | 52 | «HeyDoctor» (24–28 px) | Auth cards, composiciones amplias |
| `footer` | 44 | «HeyDoctor» (22 px) | Footer de landing |
| `enterprise` | — | Solo texto enterprise | Contextos B2B |
| `markOnly` | `markSize` prop | Sin wordmark | Teleconsulta, modales, favicons inline |

El wordmark usa `text-primary` (`#078A92`) en todas las variantes visibles de producto.

### Superficies con escala contextual (Fase 18)

Algunas páginas aplican `scale-[1.12]` vía `className` en el consumidor (no en `BrandLogo`) para igualar peso visual con el diseño de referencia:

- Landing nav (`components/landing/LandingNavClient.tsx`)
- Login y Register (`app/login/page.tsx`, `app/register/page.tsx`)

Esto **no altera** el asset ni el flujo SSOT; solo ajusta el tamaño de renderizado en esas superficies.

---

## Restricciones arquitectónicas

1. **Un solo SVG oficial** en `public/brand/heydoctor-icon.svg`.
2. **Un solo flujo de resolución:** `getBrandMarkSrc()` → `BrandMarkProvider` → `useBrandMarkSrc()` → `BrandLogo`.
3. **Sin rutas hardcodeadas** del isotipo en componentes de UI (`/brand/...`, `/logo-heydoctor.png`, etc.).
4. **Sin componentes paralelos** de logo (`AppLogo`, `Logo`, `HeaderLogo`, etc.).
5. **Separación servidor/cliente:** `getBrandMarkSrc()` solo en server; hooks solo en client.
6. **WhatsApp icon** es independiente (`components/WhatsappIcon.tsx`); no forma parte del Branding SSOT del isotipo.

---

## Modificaciones permitidas

| Tipo | Ejemplo | Condición |
|---|---|---|
| **Corrección quirúrgica del SVG** | Ajuste de geometría (letra «e», anillo del estetoscopio) | Solo en `public/brand/heydoctor-icon.svg`; sin rediseñar ni duplicar assets. |
| **Tamaño de renderizado en consumidor** | `markSize`, `className` con `scale-*` | Solo en la página o layout que consume `BrandLogo`; sin modificar proporciones internas del SVG. |
| **Color del wordmark** | Clases Tailwind `text-primary` en `BrandWordmark` | Debe mantener `#078A92` como color corporativo. |
| **Nueva superficie de producto** | Añadir `<BrandLogo variant="nav" />` en una página | Usar variantes existentes; no crear lógica de resolución propia. |
| **Documentación** | Actualizar este archivo | Cuando cambie el contrato arquitectónico (requiere revisión explícita). |

---

## Modificaciones prohibidas

| Acción | Motivo |
|---|---|
| Crear nuevos SVG de isotipo en `public/` o `public/brand/` | Rompe el SSOT. |
| Duplicar el asset (copias, symlinks alternativos, CDN propio) | Fuente de divergencia visual. |
| Vectorizar o regenerar el SVG desde PNG/IA de forma automática | Degrada fidelidad y rompe el control de calidad. |
| Modificar `BrandLogo`, `BrandMarkProvider`, `useBrandMarkSrc()` o `getBrandMarkSrc()` sin aprobación arquitectónica | Congela el flujo SSOT. |
| Renderizar el isotipo con `<img src="...">` fuera de `BrandLogo` | Bypass del flujo oficial. |
| Importar `getBrandMarkSrc()` en componentes cliente | Viola la separación server/client. |
| Añadir filtros CSS al isotipo (`invert`, `brightness-0`, etc.) salvo decisión de diseño documentada | Altera color/percepción del asset oficial. |
| Cambiar la burbuja, el wordmark interno del SVG o crear componentes de logo alternativos | Fuera del alcance del SSOT. |
| Refactorizar «de paso» la arquitectura de branding en otras tareas | Riesgo de regresión en Fase 18. |

---

## Buenas prácticas para futuras contribuciones

### Al mostrar el logo

```tsx
import { BrandLogo } from "@/components/branding";

// Header estándar
<BrandLogo variant="nav" priority />

// Solo isotipo (modales, teleconsulta)
<BrandLogo markOnly markSize={48} priority />

// Ajuste de peso visual en una superficie concreta (sin tocar BrandLogo)
<BrandLogo variant="landing" className="origin-center scale-[1.12]" />
```

### Al corregir el isotipo

1. Editar **únicamente** `public/brand/heydoctor-icon.svg`.
2. Validar visualmente contra el PNG/logo de referencia aprobado.
3. Ejecutar `npm run lint`, `npm run typecheck` y `npm run build`.
4. No commitear assets de auditoría (`visual-audit/`) ni PNGs de referencia.

### Al revisar PRs

- ¿Usa `BrandLogo` en lugar de rutas directas al SVG?
- ¿Evita nuevos archivos en `public/brand/`?
- ¿Mantiene `#078A92` en wordmark e isotipo?
- ¿El diff del SVG es quirúrgico (no rediseño completo)?
- ¿No toca el flujo `getBrandMarkSrc` → Provider → hook?

### Checklist de validación visual

- [ ] Landing (nav desktop y mobile)
- [ ] Login / Register
- [ ] Footer
- [ ] Headers nav estándar (`variant="nav"`, 36 px)
- [ ] Panel / Dashboard (sidebar + header)
- [ ] Superficies `markOnly` (teleconsulta, modales)
- [ ] Color wordmark: `rgb(7, 138, 146)` en todas las variantes
- [ ] Geometría: letra «e» y anillo del estetoscopio según diseño aprobado

---

## Referencias

- Asset README: `public/brand/README.md`
- Constantes: `lib/brand-mark.constants.ts`
- Resolución servidor: `lib/brand-mark.server.ts`
- Wiring raíz: `app/layout.tsx`
- Design token primary: `tailwind.config.js` → `primary: "#078A92"`
