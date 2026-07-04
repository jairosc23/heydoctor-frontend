import { LegalPageLayout, Section } from "@/components/LegalPageLayout";

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Política de Cookies">
      <Section id="que-son" title="1. ¿Qué son las Cookies?">
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando
          visita un sitio web. Permiten que la plataforma funcione correctamente, recuerde
          sus preferencias y mantenga su sesión activa.
        </p>
      </Section>

      <Section id="cookies-usadas" title="2. Cookies que Utilizamos">
        <p>
          <strong>HeyDoctor</strong> utiliza exclusivamente cookies estrictamente necesarias
          para el funcionamiento de la plataforma. <strong>No utilizamos cookies de publicidad,
          analíticas de terceros ni cookies de seguimiento.</strong>
        </p>

        <div className="mt-4 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Cookie</th>
                <th>Tipo</th>
                <th>Duración</th>
                <th>Propósito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>session</code></td>
                <td>Esencial</td>
                <td>Sesión</td>
                <td>Indicador de sesión activa para protección de rutas frontend</td>
              </tr>
              <tr>
                <td><code>refresh_token</code></td>
                <td>Esencial</td>
                <td>7 días</td>
                <td>Token de refresco seguro (HttpOnly, Secure, SameSite)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="cookies-terceros" title="3. Cookies de Terceros">
        <p>
          Los proveedores de pago (Payku) pueden establecer sus propias cookies durante el
          proceso de pago, fuera de la plataforma HeyDoctor. Estas cookies se rigen por las
          políticas de privacidad del proveedor respectivo.
        </p>
      </Section>

      <Section id="base-legal" title="4. Base Legal">
        <p>
          Las cookies esenciales que utilizamos son estrictamente necesarias para la prestación
          del servicio solicitado por el usuario (Ley 19.628, Chile; Art. 6(1)(b) GDPR) y no
          requieren consentimiento previo conforme a la normativa aplicable.
        </p>
      </Section>

      <Section id="gestion" title="5. Gestión de Cookies">
        <p>
          Puede configurar su navegador para bloquear o eliminar cookies. Sin embargo, al
          bloquear las cookies esenciales de HeyDoctor, la plataforma no funcionará correctamente
          (autenticación, protección de rutas, sesión).
        </p>
      </Section>

      <Section id="cambios" title="6. Cambios en esta Política">
        <p>
          Si en el futuro incorporamos cookies no esenciales (analíticas, preferencias), esta
          política se actualizará y se implementará un mecanismo de consentimiento granular
          (banner de cookies con opciones).
        </p>
      </Section>

      <Section id="contacto" title="7. Contacto">
        <p>
          <strong>SAVAC LTDA</strong> &middot; RUT 76.373.761-6<br />
          Privacy Officer: <a href="mailto:privacy@heydoctor.health">privacy@heydoctor.health</a>
        </p>
      </Section>
    </LegalPageLayout>
  );
}
