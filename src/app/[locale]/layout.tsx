import type { Metadata } from "next";
import type { ReactNode } from "react";

import { notFound } from "next/navigation";
import {
  hasLocale,
  NextIntlClientProvider,
} from "next-intl";

import {
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import {
  routing,
  rtlLocales,
  type Locale,
} from "@/i18n/routing";

import CustomCursor from "@/components/CustomCursor";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({
    locale,
    namespace: "meta",
  });

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/logo-mark.svg",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const dir = rtlLocales.includes(locale as Locale)
    ? "rtl"
    : "ltr";

  return (
    <NextIntlClientProvider>
      <div
        lang={locale}
        dir={dir}
        className="min-h-screen"
      >
        <CustomCursor />

        {children}
      </div>
    </NextIntlClientProvider>
  );
}