import type { Metadata } from 'next';
import { Inter, Noto_Sans, Noto_Sans_Devanagari, Noto_Sans_Tamil, Noto_Sans_Telugu } from 'next/font/google';
import { Toaster } from 'sonner';
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
  title: {
    default: 'CivicGuide AI - Learn About Indian Elections',
    template: '%s | CivicGuide AI',
  },
  description: 'Master Indian elections, civic engagement, and democratic processes through AI-powered learning.',
  keywords: ['Elections', 'Civic Education', 'India', 'Democracy', 'Learning', 'AI'],
  authors: [{ name: 'CivicGuide Team' }],
  creator: 'CivicGuide',
  publisher: 'CivicGuide',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://civicguide.ai',
    title: 'CivicGuide AI - Learn About Indian Elections',
    description: 'Master Indian elections, civic engagement, and democratic processes.',
    siteName: 'CivicGuide AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CivicGuide AI',
    description: 'Learn about Indian elections and civic engagement with AI.',
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23FF9933' width='33.33' height='100'/><rect fill='%23FFFFFF' x='33.33' width='33.33' height='100'/><rect fill='%23138808' x='66.66' width='33.34' height='100'/></svg>" />
      </head>
      <body className="bg-civic-light text-civic-dark">
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
