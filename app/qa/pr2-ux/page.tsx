import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import {
  HdEmptyState,
  HdErrorState,
  HdPageHeader,
  HdSection,
  HdSkeleton,
  HdSkipLink,
} from "@/components/ui/HdFeedback";

/**
 * Catálogo estático del Design System HD para auditoría visual PR2.
 * No consume APIs ni altera contratos. Ruta /qa/* es pública.
 */
export default function Pr2UxCatalogPage() {
  return (
    <div
      className="min-h-screen bg-hd-surface-base px-4 py-8 text-primaryDark md:px-6"
      data-testid="pr2-ux-catalog"
    >
      <HdSkipLink />
      <main
        id="contenido-principal"
        tabIndex={-1}
        className="mx-auto max-w-3xl space-y-6 outline-none"
      >
        <HdPageHeader
          eyebrow="PR2 · Enterprise UX"
          title="Catálogo Design System HD"
          description="Estados, tipografía, foco y componentes base usados por la plataforma."
        />

        <HdSection title="Acciones">
          <div className="flex flex-wrap gap-3">
            <Button>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button disabled>Deshabilitado</Button>
          </div>
        </HdSection>

        <HdSection title="Campo">
          <label className="block text-sm text-primaryDark" htmlFor="pr2-email">
            Correo
            <Input
              id="pr2-email"
              className="mt-1"
              placeholder="medico@heydoctor.health"
              autoComplete="off"
            />
          </label>
        </HdSection>

        <HdSection title="Superficie">
          <Card>
            <p className="text-sm font-semibold text-primaryDark">Card HD</p>
            <p className="mt-1 text-sm text-primaryDark/60">
              Borde sutil, superficie raised y sombra soft.
            </p>
          </Card>
        </HdSection>

        <HdSkeleton rows={2} testId="pr2-skeleton" />
        <HdErrorState message="No se pudo cargar el recurso. Intenta de nuevo." />
        <HdEmptyState
          title="Sin resultados"
          description="Aún no hay información para mostrar."
          href="/medicos"
          action="Buscar médico"
        />
        <HdSection title="Sección vacía" empty>
          <p>hidden</p>
        </HdSection>
      </main>
    </div>
  );
}
