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

export async function getMessagesForLocale(locale: string) {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale;

  switch (resolvedLocale) {
    case 'en':
      return (await import('../messages/en.json')).default;
    case 'hi':
      return (await import('../messages/hi.json')).default;
    case 'te':
      return (await import('../messages/te.json')).default;
    case 'ta':
      return (await import('../messages/ta.json')).default;
    case 'kn':
      return (await import('../messages/kn.json')).default;
    default:
      return (await import('../messages/en.json')).default;
  }
}
