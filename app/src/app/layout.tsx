import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = 'https://app-gamma-olive-88.vercel.app';

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GeM Analyser | Intelligence & Tender Explorer',
    template: '%s | GeM Analyser',
  },
  description:
    'Real-time Government e-Marketplace (GeM) tender intelligence, AI matchmaking, qualification scoring, and Kanban bidding pipeline for tech & software vendors.',
  applicationName: 'GeM Analyser',
  authors: [{ name: 'PraLabs', url: 'https://github.com/pra-labs' }],
  creator: 'PraLabs',
  publisher: 'PraLabs',
  keywords: [
    'GeM tenders',
    'Government e-Marketplace',
    'GeM bid portal',
    'Public procurement India',
    'AI tender scoring',
    'GeM software tenders',
    'GeM analytics',
    'Government contract bidding',
    'GeM scraper',
    'MSE quota bidding',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    title: 'GeM Analyser — Real-Time Tender Intelligence & AI Matchmaking',
    description:
      'Search, filter, and track public tenders on GeM with algorithmic qualification fit scores and SoW AI briefs.',
    siteName: 'GeM Analyser',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeM Analyser — Real-Time Tender Intelligence',
    description:
      'Discover high-margin public tenders on Government e-Marketplace with algorithmic fit scores and Kanban pipelines.',
    creator: '@pra_labs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'GeM Analyser',
  url: SITE_URL,
  description:
    'Real-time public procurement intelligence and algorithmic tender matchmaking portal for Government e-Marketplace (GeM).',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
  },
  author: {
    '@type': 'Organization',
    name: 'PraLabs',
    url: 'https://github.com/pra-labs',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
