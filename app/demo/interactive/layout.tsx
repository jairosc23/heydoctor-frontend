import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { absoluteUrl, siteName } from '../../../lib/seo';

const title = 'Interactive Demo | HeyDoctor Enterprise';
const description =
  'Demo clínica interactiva de HeyDoctor Enterprise con Mock Mode, Live Backend Mode opcional, Clinical Foundation, Copilot y Evidence Layer.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl('/demo/interactive'),
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl('/demo/interactive'),
    siteName,
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: absoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: 'Interactive Demo HeyDoctor Enterprise',
      },
    ],
  },
};

export default function InteractiveDemoLayout({ children }: { children: ReactNode }) {
  return children;
}
