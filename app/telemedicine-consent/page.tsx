import Link from "next/link";
import { LegalPageLayout, Section } from "@/components/LegalPageLayout";

export default function TelemedicineConsentPage() {
  return (
    <LegalPageLayout title="Consentimiento Informado para Telemedicina">
      <Section id="objeto" title="1. Objeto del Consentimiento">
        <p>
          Este documento constituye el consentimiento informado que usted otorga para recibir
          atención médica a distancia (telemedicina) a través de la plataforma <strong>HeyDoctor</strong>,
          operada por <strong>SAVAC LTDA</strong> (RUT 76.373.761-6).
        </p>
        <p>
          Al aceptar este consentimiento, usted declara que ha sido informado sobre las
          características, alcances, limitaciones y riesgos de la atención por telemedicina.
        </p>
      </Section>

      <Section id="modalidad" title="2. Modalidad de Atención">
        <p>
          La consulta se realizará mediante videollamada en tiempo real (WebRTC) entre usted
          y un profesional de la salud habilitado. La sesión puede incluir intercambio de
          información clínica, visualización de imágenes, revisión de síntomas y emisión de
          diagnóstico presuntivo, indicaciones y/o prescripciones.
        </p>
      </Section>

      <Section id="limitaciones" title="3. Limitaciones de la Telemedicina">
        <p>Usted comprende y acepta que:</p>
        <ul>
          <li>La telemedicina <strong>no sustituye la atención presencial de urgencia</strong></li>
          <li>El profesional no puede realizar un examen físico directo</li>
          <li>La calidad del servicio depende de su conexión a internet y dispositivo</li>
          <li>El diagnóstico puede tener limitaciones inherentes a la modalidad remota</li>
          <li>En caso de signos de alarma, debe acudir a un servicio de urgencias presencial</li>
        </ul>
      </Section>

      <Section id="datos-clinicos" title="4. Uso de Datos Clínicos">
        <p>
          Al otorgar este consentimiento, usted autoriza el registro de los datos clínicos
          generados durante la consulta (motivo, diagnóstico, tratamiento, notas clínicas,
          firma digital) en el sistema HeyDoctor. Estos datos se almacenan conforme a nuestra{" "}
          <Link href="/privacy">Política de Privacidad</Link> y
          la normativa sanitaria aplicable.
        </p>
        <p>
          Los datos clínicos están protegidos por aislamiento multi-tenant, acceso restringido
          y auditoría completa de cada operación.
        </p>
      </Section>

      <Section id="firma" title="5. Firma Digital">
        <p>
          La firma digital capturada durante la consulta tiene carácter probatorio y se vincula
          inmutablemente al registro de la consulta. Una vez firmada, la consulta no puede ser
          modificada (estado &ldquo;locked&rdquo;).
        </p>
      </Section>

      <Section id="registro" title="6. Registro del Consentimiento">
        <p>
          Al aceptar este consentimiento en la plataforma, se registra automáticamente:
        </p>
        <ul>
          <li>Fecha y hora exacta de aceptación (timestamp del servidor)</li>
          <li>Versión del documento de consentimiento aceptada</li>
          <li>Dirección IP del dispositivo</li>
          <li>Información del navegador (User-Agent)</li>
          <li>Identificador del usuario y clínica</li>
        </ul>
        <p>
          Este registro constituye evidencia legal del consentimiento y se vincula a cada
          consulta creada posteriormente.
        </p>
      </Section>

      <Section id="revocacion" title="7. Revocación">
        <p>
          Usted puede revocar este consentimiento en cualquier momento contactando a{" "}
          <a href="mailto:soporte@heydoctor.health">soporte@heydoctor.health</a>.
          La revocación no afecta la licitud del tratamiento realizado antes de la misma ni
          la validez de las consultas ya completadas.
        </p>
      </Section>

      <Section id="versionado" title="8. Versionado">
        <p>
          Este consentimiento está versionado. Si el contenido legal cambia sustancialmente,
          se publicará una nueva versión y se le solicitará aceptarla antes de poder iniciar
          nuevas consultas. Las versiones anteriores permanecen vinculadas a las consultas
          en que fueron aceptadas.
        </p>
      </Section>

      <Section id="contacto" title="9. Contacto">
        <p>
          <strong>SAVAC LTDA</strong> &middot; RUT 76.373.761-6<br />
          Legal: <a href="mailto:legal@heydoctor.health">legal@heydoctor.health</a><br />
          Soporte: <a href="mailto:soporte@heydoctor.health">soporte@heydoctor.health</a>
        </p>
      </Section>
    </LegalPageLayout>
  );
}
