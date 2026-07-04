import { LegalPageLayout, Section } from "@/components/LegalPageLayout";

export default function DataProcessingPage() {
  return (
    <LegalPageLayout title="Acuerdo de Tratamiento de Datos">
      <Section id="partes" title="1. Partes">
        <p>
          Este Acuerdo de Tratamiento de Datos (&ldquo;DPA&rdquo;) se celebra entre el
          usuario (&ldquo;Responsable del Tratamiento&rdquo;) y <strong>SAVAC LTDA</strong>,
          RUT 76.373.761-6, operadora de <strong>HeyDoctor</strong>
          (&ldquo;Encargado del Tratamiento&rdquo;).
        </p>
      </Section>

      <Section id="objeto" title="2. Objeto">
        <p>
          El presente acuerdo regula las obligaciones de protección de datos entre las partes
          en relación con el tratamiento de datos personales y datos de salud a través de la
          plataforma HeyDoctor, conforme a la Ley 19.628 (Chile) y, cuando aplique, el GDPR
          (UE).
        </p>
      </Section>

      <Section id="datos-tratados" title="3. Categorías de Datos Tratados">
        <p><strong>Datos identificativos:</strong> nombre, correo electrónico, dirección IP.</p>
        <p><strong>Datos de salud (categoría especial):</strong> motivo de consulta, diagnóstico, tratamiento, notas clínicas, firma digital médica.</p>
        <p><strong>Datos de transacción:</strong> identificadores de pago, montos, estados.</p>
        <p><strong>Datos técnicos:</strong> logs de auditoría, user-agent, timestamps.</p>
      </Section>

      <Section id="obligaciones" title="4. Obligaciones del Encargado">
        <p>SAVAC LTDA, como encargado del tratamiento, se compromete a:</p>
        <ul>
          <li>Tratar los datos únicamente conforme a las instrucciones documentadas del responsable</li>
          <li>Garantizar la confidencialidad del personal con acceso a datos</li>
          <li>Implementar medidas técnicas y organizativas adecuadas (cifrado, control de acceso, auditoría)</li>
          <li>No subcontratar sin autorización previa (sub-encargados actuales: Railway, DigitalOcean, Payku)</li>
          <li>Asistir al responsable en el cumplimiento de solicitudes de derechos de los titulares</li>
          <li>Notificar brechas de seguridad dentro de las 72 horas siguientes a su detección</li>
          <li>Eliminar o devolver datos al término de la relación, salvo obligación legal de conservación</li>
        </ul>
      </Section>

      <Section id="medidas" title="5. Medidas de Seguridad Implementadas">
        <ul>
          <li>Cifrado TLS 1.2+ en tránsito</li>
          <li>Hashing bcrypt (12 rounds) para credenciales</li>
          <li>Tokens JWT de corta duración (15 min) + refresh HttpOnly</li>
          <li>Detección de reutilización de tokens con revocación masiva</li>
          <li>Aislamiento multi-tenant por clinic_id</li>
          <li>Content Security Policy (CSP) estricta</li>
          <li>Audit trail inmutable con metadata completa</li>
          <li>Límite de sesiones activas (máximo 5 por usuario)</li>
          <li>Consentimiento versionado con snapshot inmutable vinculado a consulta</li>
        </ul>
      </Section>

      <Section id="subencargados" title="6. Sub-encargados Autorizados">
        <p>Los siguientes proveedores actúan como sub-encargados del tratamiento:</p>
        <ul>
          <li><strong>Railway</strong> &mdash; hosting de aplicación y base de datos (PostgreSQL)</li>
          <li><strong>DigitalOcean</strong> &mdash; servidor TURN para WebRTC</li>
          <li><strong>Payku</strong> &mdash; procesamiento de pagos</li>
        </ul>
      </Section>

      <Section id="transferencias" title="7. Transferencias Internacionales">
        <p>
          Los datos pueden ser procesados en infraestructura ubicada fuera de Chile.
          SAVAC LTDA garantiza que dichas transferencias se realizan bajo cláusulas
          contractuales que aseguran un nivel adecuado de protección, conforme a los
          estándares internacionales aplicables.
        </p>
      </Section>

      <Section id="duracion" title="8. Duración y Terminación">
        <p>
          Este acuerdo es vigente mientras el usuario mantenga una cuenta activa en HeyDoctor.
          A la terminación, SAVAC LTDA eliminará los datos personales del usuario, salvo los
          que deban conservarse por obligación legal (registros clínicos: 15 años; registros
          de auditoría: indefinido).
        </p>
      </Section>

      <Section id="contacto" title="9. Contacto">
        <p>
          <strong>SAVAC LTDA</strong> &middot; RUT 76.373.761-6<br />
          Privacy Officer / DPO: <a href="mailto:privacy@heydoctor.health">privacy@heydoctor.health</a>
        </p>
      </Section>
    </LegalPageLayout>
  );
}
