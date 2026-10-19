import PanelLayout from "@/components/PanelLayout";
import { ConsultationProvider } from "@/context/ConsultationContext";

export default function PanelRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PanelLayout>
      <ConsultationProvider>{children}</ConsultationProvider>
    </PanelLayout>
  );
}
