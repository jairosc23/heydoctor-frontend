import Link from "next/link";
import { LegalPageLayout, Section } from "@/components/LegalPageLayout";

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Política de Privacidad">
      <Section id="responsable" title="1. Responsable del Tratamiento">
        <p>
          El responsable del tratamiento de sus datos personales es <strong>SAVAC LTDA</strong>,
          RUT 76.373.761-6, operadora de la plataforma <strong>HeyDoctor</strong>. Para operaciones
          internacionales: <strong>SAVAC MedTech LLC</strong>, EIN 99-0757282.
        </p>
        <p>
          Delegado de Protección de Datos (DPO) / Privacy Officer:{" "}
          <a href="mailto:privacy@heydoctor.health">privacy@heydoctor.health</a>
        </p>
      </Section>

      <Section id="datos-recopilados" title="2. Datos que Recopilamos">
        <p><strong>Datos de cuenta:</strong> nombre, correo electrónico, contraseña (hash cifrado), rol.</p>
        <p><strong>Datos clínicos:</strong> motivo de consulta, diagnóstico, tratamiento, notas clínicas, firma digital del profesional, grabaciones de teleconsulta (cuando aplique).</p>
        <p><strong>Datos de consentimiento:</strong> fecha de aceptación, versión del documento, dirección IP, user-agent del navegador.</p>
        <p><strong>Datos de pago:</strong> identificador de transacción, monto, estado. No almacenamos datos de tarjeta; los pagos son procesados por Payku.</p>
        <p><strong>Datos técnicos:</strong> dirección IP, navegador, sistema operativo, registros de auditoría (audit logs) de acciones en la plataforma.</p>
      </Section>

      <Section id="base-legal" title="3. Base Legal del Tratamiento">
        <p><strong>Chile:</strong> Ley 19.628 sobre Protección de la Vida Privada. El tratamiento se basa en el consentimiento del titular y en la ejecución del contrato de servicio.</p>
        <p><strong>Unión Europea (GDPR-ready):</strong> Art. 6(1)(a) consentimiento, Art. 6(1)(b) ejecución contractual, Art. 9(2)(h) asistencia sanitaria.</p>
        <p><strong>USA:</strong> Cumplimiento con prácticas comerciales razonables y preparación para estándares HIPAA.</p>
      </Section>

      <Section id="finalidad" title="4. Finalidad del Tratamiento">
        <p>Utilizamos sus datos para:</p>
        <ul>
          <li>Prestar el servicio de telemedicina y gestión clínica</li>
          <li>Procesar pagos por consultas</li>
          <li>Generar documentación legal (PDFs, consentimientos)</li>
          <li>Cumplir obligaciones legales y regulatorias</li>
          <li>Mejorar la plataforma y prevenir fraude</li>
          <li>Comunicaciones sobre su cuenta o servicio</li>
        </ul>
      </Section>

      <Section id="salud" title="5. Protección de Datos de Salud">
        <p>
          Los datos de salud reciben protección reforzada: se almacenan con acceso restringido
          al profesional de salud asignado y al paciente. El acceso está protegido por
          autenticación JWT con tokens de corta duración y refresh tokens en cookies HttpOnly.
          Cada acceso queda registrado en el sistema de auditoría (audit trail).
        </p>
        <p>
          Los datos clínicos se vinculan al tenant (clínica) correspondiente, garantizando
          aislamiento multi-tenant entre organizaciones.
        </p>
      </Section>

      <Section id="compartir" title="6. Compartir Información">
        <p><strong>No vendemos ni compartimos sus datos con terceros para fines publicitarios.</strong></p>
        <p>Podemos compartir datos con:</p>
        <ul>
          <li><strong>Proveedores de pago</strong> (Payku) para procesar transacciones</li>
          <li><strong>Proveedores de infraestructura</strong> (Railway, DigitalOcean) para hosting</li>
          <li><strong>Autoridades</strong> cuando sea requerido por ley o resolución judicial</li>
        </ul>
      </Section>

      <Section id="retencion" title="7. Retención de Datos">
        <p>
          Los registros clínicos se retienen por el período mínimo exigido por la legislación
          sanitaria aplicable (Chile: 15 años conforme al DS N° 41/2012). Los datos de cuenta
          se retienen mientras la cuenta esté activa. Los registros de auditoría se retienen
          de forma indefinida para trazabilidad legal.
        </p>
      </Section>

      <Section id="derechos" title="8. Sus Derechos (ARCO + GDPR)">
        <p>Usted tiene derecho a:</p>
        <ul>
          <li><strong>Acceso:</strong> solicitar copia de sus datos personales</li>
          <li><strong>Rectificación:</strong> corregir datos inexactos</li>
          <li><strong>Cancelación/Supresión:</strong> solicitar eliminación (sujeto a retención legal obligatoria)</li>
          <li><strong>Oposición:</strong> oponerse al tratamiento en casos específicos</li>
          <li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado (GDPR Art. 20)</li>
          <li><strong>Limitación:</strong> restringir el tratamiento (GDPR Art. 18)</li>
        </ul>
        <p>
          Para ejercer estos derechos:{" "}
          <a href="mailto:privacy@heydoctor.health">privacy@heydoctor.health</a>.
          Respuesta máxima: 30 días hábiles.
        </p>
      </Section>

      <Section id="seguridad" title="9. Medidas de Seguridad">
        <ul>
          <li>Cifrado en tránsito (TLS 1.2+)</li>
          <li>Autenticación con access tokens de corta duración (15 min)</li>
          <li>Refresh tokens en cookies HttpOnly, Secure, SameSite</li>
          <li>Detección de reutilización de tokens con revocación masiva</li>
          <li>Límite de sesiones activas por usuario (máximo 5)</li>
          <li>Hashing de contraseñas con bcrypt (12 rounds)</li>
          <li>Audit trail completo con metadata estructurada</li>
          <li>Content Security Policy (CSP) estricta</li>
          <li>Aislamiento multi-tenant por clinic_id</li>
        </ul>
      </Section>

      <Section id="cookies" title="10. Cookies">
        <p>
          Utilizamos cookies estrictamente necesarias para el funcionamiento de la plataforma.
          Para más información, consulte nuestra{" "}
          <Link href="/cookies">Política de Cookies</Link>.
        </p>
      </Section>

      <Section id="transferencias" title="11. Transferencias Internacionales">
        <p>
          Sus datos pueden ser procesados en servidores ubicados fuera de Chile (Railway,
          DigitalOcean). Estas transferencias se realizan bajo cláusulas contractuales que
          garantizan un nivel adecuado de protección conforme a la normativa aplicable.
        </p>
      </Section>

      <Section id="contacto" title="12. Contacto">
        <p>
          <strong>SAVAC LTDA</strong> &middot; RUT 76.373.761-6<br />
          Privacy Officer / DPO: <a href="mailto:privacy@heydoctor.health">privacy@heydoctor.health</a>
        </p>
      </Section>
    </LegalPageLayout>
  );
}
