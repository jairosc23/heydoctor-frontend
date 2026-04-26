import Button from "@/components/ui/Button";

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
      className="whatsapp-cta-button min-h-[56px] text-lg font-[family-name:Montserrat,sans-serif]"
    >
      <span aria-hidden className="mr-2.5 text-2xl">
        💬
      </span>
      {label}
    </Button>
  );
}
