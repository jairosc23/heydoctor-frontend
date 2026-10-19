# HeyDoctor Frontend 🩺🚀  
Frontend oficial del ecosistema clínico y de telemedicina **HeyDoctor**, desarrollado por  
**Dr. Jairo Santana – SAVAC MedTech LLC**.

Este repositorio contiene el nuevo frontend moderno, minimalista y de alto rendimiento
construido sobre **Next.js 14**, **TypeScript** y **TailwindCSS**, diseñado para ofrecer:

- Atención médica presencial y online  
- Videoconsultas médicas seguras  
- Flujo completo médico/paciente  
- Módulo legal integrado  
- Integración futura con la App HeyDoctor (próxima etapa)  
- UI profesional, minimalista y accesible  

---

## 🧩 Tecnologías Principales

- **Next.js 14 (App Router)**
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **ESLint + Prettier**
- **ShadCN/UI (opcional)**
- Deploy recomendado: **Vercel**

---

## 📂 Estructura del Proyecto

```
/heydoctor-frontend
  /app
    /page.tsx              → Landing Page
    /patient               → Módulo Paciente
    /doctor                → Módulo Médico
    /video                 → Videoconsulta
    /legal                 → Términos y Políticas
    layout.tsx             → Layout global
  /components              → Componentes compartidos
  /public                  → Logos, imágenes y assets estáticos
  /styles
  package.json
  README.md
  tailwind.config.js
```

---

## 📥 Migración desde archivos HTML

Para portar los archivos HTML existentes a este frontend moderno:

1. Copiar tus `.html` actuales dentro del directorio raíz del proyecto.  
2. Crear una carpeta temporal:  
   ```
   /legacy-html
   ```
3. Por cada archivo HTML:
   - Extraer estructura, estilos, textos y componentes  
   - Convertirlo en página Next.js (`page.tsx`)
4. Mover imágenes a **/public**
5. Aplicar el diseño minimalista oficial HeyDoctor

---

## 📜 Scripts

```
npm install        → Instala dependencias
npm run dev        → Ejecuta el frontend (sirve /public en local)
npm run build      → Build estático
npm run preview    → Previsualiza el build estático
```

---

## 🛣️ Roadmap

- [x] Configuración inicial del repo  
- [x] Migración desde HTML  
- [ ] Crear Landing Page moderna  
- [ ] Módulo Paciente  
- [ ] Módulo Médico  
- [ ] Videollamadas WebRTC  
- [ ] Indicaciones médicas  
- [ ] Panel administrativo  
- [ ] Integración App HeyDoctor  
- [ ] β Testing con pacientes reales  

---

## 👨‍⚕️ Autor

**Dr. Jairo Santana Candelo**  
Médico, Cirujano, Fundador de **HeyDoctor**  
SAVAC MedTech LLC – USA  
Viña del Mar – Chile  

---

## 📝 Licencia

© 2025 SAVAC MedTech LLC. Todos los derechos reservados.# test
