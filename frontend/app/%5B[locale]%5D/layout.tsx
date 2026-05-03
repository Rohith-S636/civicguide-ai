import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { defaultLocale, locales, type Locale } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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

  const messages = await getMessages();
  const resolvedLocale = (locales.includes(locale as Locale) ? locale : defaultLocale) as Locale;

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
      <div className="relative min-h-full">
        <div className="sticky top-0 z-30 flex justify-end px-4 pt-4">
          <LanguageSwitcher />
        </div>
        <div className="pb-6">
          {children}
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
