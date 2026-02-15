import PanelLayout from "@/components/PanelLayout";

export default function PanelRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PanelLayout>{children}</PanelLayout>;
}
