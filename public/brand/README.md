## HeyDoctor — Branding assets (SSOT)

Esta carpeta define los **assets oficiales de marca** del frontend.

### Drop-in (sin cambios de código)

| Archivo | Uso | Fallback actual |
|---------|-----|-----------------|
| `heydoctor-icon.svg` | Navbar, footer, wordmark, favicon | `public/logo-heydoctor.png` |
| `hero-doctor.{jpg,jpeg,webp,png}` | Imagen principal del mockup en Landing Hero | `public/og-image.jpg` |
| `patient-pip.{jpg,jpeg,webp,png}` | Imagen PiP del paciente en Landing Hero | Silueta CSS en el componente |

### Resolución automática

- **Brand mark:** `lib/brand-mark.server.ts` → `getBrandMarkSrc()`
- **Landing hero:** `lib/landing-assets.server.ts` → `getLandingHeroAssets()`

Cuando un archivo oficial exista en esta carpeta, los componentes lo usarán automáticamente.

### Opcional

- `heydoctor-logo-animated.svg` — splash/animación de primera carga si producto lo requiere.
