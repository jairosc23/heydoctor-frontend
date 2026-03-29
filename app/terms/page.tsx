import Link from "next/link";
import { LegalPageLayout, Section } from "@/components/LegalPageLayout";

export default function TermsPage() {
  return (
    <LegalPageLayout title="Términos y Condiciones de Uso">
      <Section id="identidad" title="1. Identificación del Prestador">
        <p>
          La plataforma <strong>HeyDoctor</strong> es operada por <strong>SAVAC LTDA</strong>,
          RUT 76.373.761-6, sociedad constituida bajo las leyes de la República de Chile, con
          marca registrada <em>SAVAC Bienestar y Salud</em> (INAPI N° 1435386). Para operaciones
          internacionales, actúa a través de <strong>SAVAC MedTech LLC</strong> (EIN 99-0757282),
          constituida en los Estados Unidos de América.
        </p>
        <p>Contacto legal: <a href="mailto:legal@heydoctor.health" style={{ color: "#078a92" }}>legal@heydoctor.health</a></p>
      </Section>

      <Section id="aceptacion" title="2. Aceptación de los Términos">
        <p>
          Al acceder, registrarse o utilizar HeyDoctor, usted declara haber leído, comprendido
          y aceptado íntegramente estos Términos y Condiciones. Si no está de acuerdo, debe
          abstenerse de utilizar la plataforma. El uso continuado tras la publicación de
          modificaciones constituye aceptación de las mismas.
        </p>
      </Section>

      <Section id="servicio" title="3. Descripción del Servicio">
        <p>
          HeyDoctor es una plataforma tecnológica de telemedicina que facilita la conexión entre
          pacientes y profesionales de la salud habilitados para consultas médicas a distancia
          mediante videollamada, gestión de registros clínicos digitales, firma electrónica y
          procesamiento de pagos.
        </p>
        <p>
          <strong>HeyDoctor actúa exclusivamente como intermediario tecnológico.</strong> No presta
          servicios médicos directamente ni se responsabiliza por los diagnósticos, tratamientos
          o recomendaciones emitidas por los profesionales que utilizan la plataforma.
        </p>
      </Section>

      <Section id="telemedicina" title="4. Limitaciones de la Telemedicina">
        <p>
          La atención por telemedicina tiene limitaciones inherentes: no permite examen físico
          directo, depende de la calidad de la conexión a internet y de la veracidad de la
          información proporcionada por el paciente.
        </p>
        <p>
          <strong>HeyDoctor NO reemplaza la atención médica de urgencia.</strong> En caso de
          emergencia médica, contacte inmediatamente a los servicios de emergencia locales
          (Chile: 131 / SAMU; USA: 911).
        </p>
      </Section>

      <Section id="registro" title="5. Registro y Cuenta">
        <p>
          Para acceder a los servicios, el usuario debe crear una cuenta proporcionando
          información veraz, completa y actualizada. El usuario es responsable de la
          confidencialidad de sus credenciales de acceso y de toda actividad realizada
          bajo su cuenta.
        </p>
        <p>
          Los profesionales de la salud deben acreditar su habilitación profesional vigente
          en su jurisdicción para utilizar las funcionalidades clínicas de la plataforma.
        </p>
      </Section>

      <Section id="responsabilidad-medica" title="6. Responsabilidad Médica">
        <p>
          El profesional de la salud que atiende a través de HeyDoctor es el único responsable
          del acto médico, incluyendo diagnósticos, prescripciones, indicaciones y tratamientos.
          SAVAC LTDA / SAVAC MedTech LLC no ejercen la medicina ni controlan el criterio clínico
          de los profesionales.
        </p>
        <p>
          El profesional debe cumplir con la normativa ética y legal aplicable en su jurisdicción,
          incluyendo la Ley 20.584 sobre Derechos y Deberes de los Pacientes (Chile) y las
          regulaciones aplicables en cada país donde atienda.
        </p>
      </Section>

      <Section id="pagos" title="7. Pagos y Facturación">
        <p>
          Los pagos por consultas se procesan a través de proveedores de pago externos
          autorizados (actualmente Payku). <strong>HeyDoctor no almacena datos de tarjetas
          de crédito ni débito.</strong> Las tarifas se muestran antes de confirmar cada
          consulta y son definitivas salvo política de reembolso aplicable.
        </p>
        <p>
          Los reembolsos se gestionan caso a caso. Las solicitudes deben dirigirse a{" "}
          <a href="mailto:soporte@heydoctor.health" style={{ color: "#078a92" }}>soporte@heydoctor.health</a>.
        </p>
      </Section>

      <Section id="datos" title="8. Protección de Datos Personales">
        <p>
          El tratamiento de datos personales se rige por nuestra{" "}
          <Link href="/privacy" style={{ color: "#078a92" }}>Política de Privacidad</Link>,
          conforme a la Ley 19.628 sobre Protección de la Vida Privada (Chile) y, para usuarios
          europeos, el Reglamento General de Protección de Datos (GDPR) de la Unión Europea.
        </p>
      </Section>

      <Section id="consentimiento" title="9. Consentimiento Informado">
        <p>
          Antes de cada consulta de telemedicina, el usuario debe otorgar su{" "}
          <Link href="/telemedicine-consent" style={{ color: "#078a92" }}>consentimiento informado</Link>{" "}
          electrónico. Este consentimiento se registra con fecha, hora, versión del documento,
          dirección IP y se vincula inmutablemente a la consulta correspondiente.
        </p>
      </Section>

      <Section id="propiedad" title="10. Propiedad Intelectual">
        <p>
          La marca HeyDoctor, el software, diseño, código fuente, documentación y contenido
          de la plataforma son propiedad de SAVAC LTDA y/o SAVAC MedTech LLC. La marca SAVAC
          Bienestar y Salud se encuentra registrada ante INAPI (Chile) bajo el N° 1435386.
          Se prohíbe la reproducción, distribución o modificación sin autorización expresa.
        </p>
      </Section>

      <Section id="responsabilidad" title="11. Limitación de Responsabilidad">
        <p>
          En la máxima medida permitida por la ley aplicable, SAVAC LTDA y SAVAC MedTech LLC
          no serán responsables por daños directos, indirectos, incidentales o consecuentes
          derivados del uso de la plataforma, incluyendo interrupciones técnicas, pérdida de
          datos o decisiones médicas basadas en las consultas realizadas.
        </p>
      </Section>

      <Section id="jurisdiccion" title="12. Ley Aplicable y Jurisdicción">
        <p>
          Estos Términos se rigen por las leyes de la República de Chile. Para la resolución
          de controversias, las partes se someten a la jurisdicción de los tribunales ordinarios
          de justicia de la ciudad de Santiago de Chile, sin perjuicio de los derechos que
          correspondan al consumidor conforme a la legislación vigente.
        </p>
      </Section>

      <Section id="modificaciones" title="13. Modificaciones">
        <p>
          SAVAC LTDA se reserva el derecho de modificar estos Términos. Las modificaciones
          se publicarán en esta página con la nueva fecha de vigencia. El uso continuado de
          la plataforma tras la publicación constituye aceptación de los cambios.
        </p>
      </Section>

      <Section id="contacto" title="14. Contacto">
        <p>
          Para consultas sobre estos términos:<br />
          <strong>SAVAC LTDA</strong> &middot; RUT 76.373.761-6<br />
          Email: <a href="mailto:legal@heydoctor.health" style={{ color: "#078a92" }}>legal@heydoctor.health</a><br />
          Soporte: <a href="mailto:soporte@heydoctor.health" style={{ color: "#078a92" }}>soporte@heydoctor.health</a>
        </p>
      </Section>
    </LegalPageLayout>
  );
}
