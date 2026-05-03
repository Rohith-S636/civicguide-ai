"use client";

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { getLocalizedPathname, localeFlags, localeLabels, locales, type Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.lang = currentLocale;
  }, [currentLocale]);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/95 p-1 shadow-sm backdrop-blur">
      {locales.map((locale) => {
        const active = locale === currentLocale;

        return (
          <button
            key={locale}
            type="button"
            onClick={() => router.push(getLocalizedPathname(pathname, locale))}
            aria-pressed={active}
            aria-label={`Switch language to ${localeLabels[locale]}`}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-all ${
              active
                ? 'bg-saffron text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span aria-hidden="true">{localeFlags[locale]}</span>
            <span>{localeLabels[locale]}</span>
          </button>
        );
      })}
    </div>
  );
}