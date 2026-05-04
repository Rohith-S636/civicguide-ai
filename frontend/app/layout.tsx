import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import Image from 'next/image';
import { Inter, Noto_Sans, Noto_Sans_Devanagari, Noto_Sans_Tamil, Noto_Sans_Telugu } from 'next/font/google';
import { Toaster } from 'sonner';
import AppBootstrap from '@/components/AppBootstrap';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: '--font-noto-devanagari',
  subsets: ['devanagari'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const notoTamil = Noto_Sans_Tamil({
  variable: '--font-noto-tamil',
  subsets: ['tamil'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const notoTelugu = Noto_Sans_Telugu({
  variable: '--font-noto-telugu',
  subsets: ['telugu'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://civicguide-ai.vercel.app'),
  title: 'CivicGuide AI — Your Smart Election Assistant',
  description: "Learn about Indian elections, voter registration, and democracy with AI-powered guidance in English, Hindi, Telugu, and Tamil,kannada.",
  keywords: ['Indian elections', 'voter registration', 'ECI', 'election guide', 'civic education'],
  authors: [{ name: 'CivicGuide Team' }],
  creator: 'CivicGuide',
  publisher: 'CivicGuide',
  robots: 'index, follow',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'CivicGuide AI — Your Smart Election Assistant',
    description: "Learn about Indian elections, voter registration, and democracy with AI-powered guidance.",
    siteName: 'CivicGuide AI',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'CivicGuide AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CivicGuide AI — Your Smart Election Assistant',
    description: "Learn about Indian elections and civic engagement with AI.",
    images: ['/twitter-image'],
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
      className={`${inter.variable} ${notoSans.variable} ${notoDevanagari.variable} ${notoTamil.variable} ${notoTelugu.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF9933" />
        <link rel="icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* JSON-LD structured data: WebApplication + FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'CivicGuide AI',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://civicguide-ai.vercel.app',
              description:
                'CivicGuide AI provides AI-powered guidance on Indian elections, voter registration, and civic education in multiple Indian languages.',
              applicationCategory: 'Education',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'INR',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                { '@type': 'Question', 'name': 'Who can vote in Indian elections?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Any Indian citizen aged 18 or above who is registered on the electoral roll for their constituency.' } },
                { '@type': 'Question', 'name': 'How do I register to vote?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'You can register online via the Election Commission of India portal or visit your local electoral office with required ID and proof of residence.' } },
                { '@type': 'Question', 'name': 'What documents are required to register?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Proof of identity (Aadhaar, passport, voter ID), proof of residence, and a passport-sized photo are commonly required.' } },
                { '@type': 'Question', 'name': 'How can I find my polling station?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Polling station details are available on your voter ID card, the ECI portal, or your local electoral office.' } },
                { '@type': 'Question', 'name': 'Can NRIs vote in Indian elections?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, NRIs can vote if they are registered on the electoral roll and follow the procedures outlined by the Election Commission for absentee voting (where applicable).' } },
                { '@type': 'Question', 'name': 'What is voter ID and how to get it?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Voter ID (Electors Photo Identity Card) is issued by the Election Commission. Apply online via the ECI portal or at local registration offices.' } },
                { '@type': 'Question', 'name': 'How are elections conducted in India?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Elections are conducted by the Election Commission using electronic voting machines (EVMs) and are overseen by appointed officials to ensure fairness.' } },
                { '@type': 'Question', 'name': 'How can I check if my name is on the electoral roll?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Search the electoral roll on the ECI website or check via state CEO portals using your details.' } },
                { '@type': 'Question', 'name': 'What should I do if my polling station changes?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Check updated polling details on the ECI portal and your local election office; notifications are also often sent by SMS if available.' } },
                { '@type': 'Question', 'name': 'How to vote if I am traveling during elections?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'If you will be away, you can plan ahead: some provisions exist for postal ballots for certain categories, or you can update your address before the rolls are finalized.' } },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-civic-light text-civic-dark">
        <AppBootstrap />
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="w-64 border-r border-gray-200 bg-white shadow-sm hidden md:block">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-civic rounded-lg flex items-center justify-center text-white font-bold">
                  CG
                </div>
                <div>
                  <h1 className="text-lg font-bold text-civic-dark">CivicGuide</h1>
                  <p className="text-xs text-gray-500">Learn • Engage • Vote</p>
                </div>
              </div>
            </div>

            <nav className="p-4 space-y-1">
              <NavLink href="/" icon="🏠" label="Dashboard" />
              <NavLink href="/learn" icon="📚" label="Learn" />
              <NavLink href="/community" icon="👥" label="Community" />
              <NavLink href="/profile" icon="👤" label="Profile" />
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 w-64">
              <div className="bg-gradient-civic-light p-4 rounded-lg">
                <p className="text-sm font-semibold text-civic-dark mb-2">Civic Fact</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  India has the world's largest democracy with over 900 million eligible voters.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          theme="light"
          richColors
          expand
          closeButton
        />
      </body>
    </html>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-saffron hover:text-white transition-all duration-200 group"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </a>
  );
}
