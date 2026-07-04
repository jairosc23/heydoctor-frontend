import Button from "@/components/ui/Button";
import { WhatsappIcon } from "@/components/WhatsappIcon";

type WhatsAppButtonProps = {
  href: string;
  label?: string;
};

/**
 * Enlace a wa.me (nueva pestaña). Reutiliza el UI kit; mantiene API estable.
 */
export function WhatsAppButton({ href, label = "Agendar por WhatsApp" }: WhatsAppButtonProps) {
  return (
    <Button
      href={href}
      variant="primary"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-cta-button inline-flex min-h-[56px] items-center gap-2.5 text-lg font-[family-name:Montserrat,sans-serif]"
    >
      <WhatsappIcon size={24} />
      {label}
    </Button>
  );
}
