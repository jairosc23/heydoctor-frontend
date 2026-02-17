# Frontend HeyDoctor – Optimización Completa

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `vercel.json` | Configurado con `version: 2` y `framework: "nextjs"` |
| `app/layout.tsx` | Añadidos enlaces a manifest y apple-touch-icon |
| `.gitignore` | Añadidos `**/public/dist/` y `heydoctor/` |
| `public/index.html` | **Eliminado** (legacy Vite) |
| `public/login.html` | **Eliminado** (legacy Vite) |
| `public/panel.html` | **Eliminado** (legacy Vite) |
| `public/dashboard.html` | **Eliminado** (legacy Vite) |
| `public/register.html` | **Eliminado** (legacy Vite) |
| `public/consultas.html` | **Eliminado** (legacy Vite) |
| `public/agenda.html` | **Eliminado** (legacy Vite) |
| `public/reportes.html` | **Eliminado** (legacy Vite) |
| `public/facturacion.html` | **Eliminado** (legacy Vite) |
| `public/firma.html` | **Eliminado** (legacy Vite) |
| `public/patient.html` | **Eliminado** (legacy Vite) |
| `public/layout.html` | **Eliminado** (legacy Vite) |
| `public/Config.html` | **Eliminado** (legacy Vite) |

## Resumen de optimizaciones

### 1. Eliminación de archivos legacy
- Eliminados todos los HTML del antiguo proyecto Vite/SPA.
- El App Router de Next.js gestiona ahora todas las rutas.
- No quedan referencias a Vite, service workers ni `src/main.tsx`.

### 2. Configuración Vercel
- `vercel.json` usa `version: 2` y `framework: "nextjs"`.
- Configuración mínima para que Vercel detecte y despliegue Next.js correctamente.

### 3. Layout raíz
- `app/layout.tsx` incluye manifest y apple-touch-icon para PWA.
- Metadata definida correctamente.

### 4. Rutas del App Router
- `/` → `app/page.tsx`
- `/login` → `app/login/page.tsx`
- `/dashboard` → `app/dashboard/page.tsx`
- `/panel` → redirige a `/dashboard`
- `/panel/*` → `app/panel/**/page.tsx`
- `/doctors/[id]` → `app/doctors/[id]/page.tsx`
- `/verify/[id]` → `app/verify/[id]/page.tsx`

### 5. Imports
- Solo imports relativos (sin alias `@/`).
- Sin módulos faltantes.

### 6. Variables de entorno
- `NEXT_PUBLIC_API_URL`: única variable usada para el backend.
- Fallback local: `http://localhost:8080`.

### 7. Archivos en `public/`
- `manifest.json` – PWA
- `robots.txt`
- `placeholder.svg`
- Imágenes: `logo-heydoctor.png`, `icon-192.png`, etc.

## Advertencias pendientes

1. **Carpeta `heydoctor/`**: Repositorio embebido. Añadida a `.gitignore`. No debe subirse.
2. **`npm audit`**: Hay vulnerabilidades en dependencias. Valorar ejecutar `npm audit fix`.
3. **PWA**: Si usas service workers, hay que registrarlos manualmente; no hay SW configurado.

## Pasos para deploy en Vercel

1. **Repositorio Git**
   - Conectar a `jairosc23/heydoctor-frontend`.
   - Root Directory vacío (raíz del repo).

2. **Variable de entorno**
   - En Vercel → Settings → Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://tu-backend.railway.app` (o la URL real del backend).

3. **Redeploy**
   - Si hubo fallos previos: Redeploy → desactivar “Use existing Build Cache”.

4. **Build**
   - Comando: `npm run build` (por defecto en Next.js).
   - Output: `.next` (Vercel lo gestiona solo).
