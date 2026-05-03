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

const isLocale = (value: string): value is Locale => {
  return (locales as readonly string[]).includes(value);
};

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

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});// Internationalization (i18n) configuration
export const languages = {
  en: 'English',
  hi: 'हिंदी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  gu: 'ગુજરાતી',
  mr: 'मराठी',
};

export type Language = keyof typeof languages;

export const defaultLanguage: Language = 'en';

export const getLocaleMessages = (locale: Language) => {
  // Import messages based on locale
  // This can be extended with actual translations
  return {
    dashboard: 'Dashboard',
    quiz: 'Quiz',
    chat: 'Chat',
    learn: 'Learn',
    profile: 'Profile',
    news: 'News',
  };
};
