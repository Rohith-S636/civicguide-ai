import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { defaultLocale, localeLabels, locales, type Locale, getMessagesForLocale } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const resolvedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const localeName = localeLabels[resolvedLocale];

  return {
    title: `${localeName} Resources`,
    description: `Learn about Indian elections and civic participation in ${localeName}.`,
    alternates: {
      canonical: `/${resolvedLocale === defaultLocale ? '' : resolvedLocale}`,
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const resolvedLocale = (locales.includes(locale as Locale) ? locale : defaultLocale) as Locale;
  const messages = await getMessagesForLocale(resolvedLocale);

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages as any}>
      <div className="relative min-h-full">
        <div className="sticky top-0 z-30 flex justify-end px-4 pt-4">
          <LanguageSwitcher />
        </div>
        <div className="pb-6">{children}</div>
      </div>
    </NextIntlClientProvider>
  );
}
