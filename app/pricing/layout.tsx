import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { absoluteUrl, siteName } from '../../lib/seo';

const title = 'Planes HeyDoctor PRO | Marketplace clínico';
const description =
  'Explora planes HeyDoctor PRO para teleconsulta, toolkit clínico e infraestructura enterprise con activación comercial.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl('/pricing'),
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl('/pricing'),
    siteName,
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: absoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: 'Planes HeyDoctor PRO',
      },
    ],
  },
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return children;
}
