import { WhatsAppQR } from "@/components/WhatsAppQR";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { WhatsappIcon } from "@/components/WhatsappIcon";

type WhatsAppPatientCTAProps = {
  url: string;
};

/**
 * Bloque landing: botón grande + QR para agendar sin fricción (pacientes / mayores).
 */
export function WhatsAppPatientCTA({ url }: WhatsAppPatientCTAProps) {
  return (
    <section
      aria-labelledby="whatsapp-agendar-heading"
      className="border-y border-green-100 bg-green-50 py-20"
    >
      <Container>
        <Card>
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center gap-6 text-center">
              <h2
                id="whatsapp-agendar-heading"
                className="text-3xl font-semibold text-gray-900"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                Agenda tu hora por WhatsApp
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-gray-600">
                Un solo toque abre el chat. Sin descargas ni registros.
              </p>
              <Button
                href={url}
                variant="primary"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-cta-button inline-flex min-h-[56px] items-center gap-2.5 text-base font-[family-name:Montserrat,sans-serif]"
              >
                <WhatsappIcon size={22} />
                Consultar por WhatsApp
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="rounded-xl bg-white p-3 shadow-soft">
                <WhatsAppQR url={url} />
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  );
}
