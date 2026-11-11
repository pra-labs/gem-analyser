import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://app-gamma-olive-88.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/scrape'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
