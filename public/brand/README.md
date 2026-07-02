## HeyDoctor — Branding assets (SSOT)

Esta carpeta define los **assets oficiales de marca** del frontend.

### Assets esperados

- `heydoctor-icon.svg` (**oficial, master**)  
  Usos: navbar, wordmark/brandmark, favicon generation, landing.

- `heydoctor-logo-animated.svg` (opcional)  
  Usos: splash/animación de primera carga si producto lo requiere.

### Fallback

Mientras el SVG master no esté disponible, el frontend usa `public/logo-heydoctor.png`
como fallback seguro. La resolución ocurre en tiempo de build/render vía `lib/brand-mark.server.ts`
(sin `<picture>` ni peticiones HTTP a un SVG inexistente).

Cuando `heydoctor-icon.svg` se añada a esta carpeta, los componentes `BrandLogo` / `BrandMark`
lo usarán automáticamente sin cambios adicionales en el Hero.

