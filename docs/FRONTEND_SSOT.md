## Frontend SSOT (Source of Truth)

**Repositorio oficial y único deployable del frontend HeyDoctor:** `jairosc23/heydoctor-frontend`.

### Alcance del SSOT

Todo lo relacionado con:

- **Landing pública**
- **Branding / assets públicos**
- **Marketplace** (si aplica)
- **Panel clínico**
- **Telemedicina**
- **Pricing**
- **Demo**
- **Admin**
- **SEO (robots, sitemap, opengraph)**
- **Componentes UI compartidos**

debe existir **solo** en este repositorio.

### Repositorios donor (READ-ONLY)

Los siguientes repositorios/directorios se consideran **donors históricos** y no deben recibir trabajo de UI:

- `SAVAC-HeyDoctor/heydoctor-backend-pro` → `frontend/` (donor, a deprecar y eliminar)
- `heydoctor-backend-pro-1/frontend` (donor)
- `jairosc23/heydoctor` → `frontend/` (histórico; archivar, no desarrollar)
- `heydoctor-frontend-clean-checkout` (snapshot local; eliminar cuando ya no se necesite)

### Política operativa

- **Prohibido** implementar nuevas features UI en donors.
- Si se requiere extraer algo de un donor, se hace como **migración explícita** hacia el SSOT.
- CI y deploy de UI se validan **solo** en `jairosc23/heydoctor-frontend`.

### Guardrail para PRs

Cualquier PR que incluya cambios UI **fuera** de `jairosc23/heydoctor-frontend` debe rechazarse.

