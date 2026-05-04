import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'hi', 'te', 'ta', 'kn'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  hi: '🇮🇳',
  te: '🇮🇳',
  ta: '🇮🇳',
  kn: '🇮🇳',
};

const isLocale = (value: string): value is Locale => locales.includes(value as Locale);

export const getLocalizedPathname = (pathname: string, targetLocale: Locale) => {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0])) {
    segments.shift();
  }

  const basePath = `/${segments.join('/')}`.replace(/\/+/g, '/');
  const normalizedBasePath = basePath === '/' ? '/' : basePath;

  if (targetLocale === defaultLocale) {
    return normalizedBasePath;
  }

  return normalizedBasePath === '/' ? `/${targetLocale}` : `/${targetLocale}${normalizedBasePath}`;
};

export default getRequestConfig(async ({ locale }: { locale?: string }) => {
  const resolvedLocale = isLocale(locale ?? '') ? (locale as Locale) : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});

