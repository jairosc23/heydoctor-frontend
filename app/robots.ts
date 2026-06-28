import type { MetadataRoute } from 'next';
import { absoluteUrl, siteUrl } from '../lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/demo/interactive', '/pricing'],
        disallow: ['/admin', '/panel', '/api'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl,
  };
}
