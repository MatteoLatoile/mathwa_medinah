import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Rubik, Cormorant_Garamond } from "next/font/google";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";
import CustomCursor from "@/components/CustomCursor";
import "../globals.css";

// Rubik couvre le latin, le cyrillique et l'arabe : une seule famille pour les 4 langues.
const rubik = Rubik({
  subsets: ["latin", "cyrillic", "arabic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-rubik",
  display: "swap",
});

// Cormorant sert aux titres en latin et en cyrillique.
// En arabe, globals.css bascule .font-display sur Rubik.
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    icons: { icon: "/logo-mark.svg" },
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
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${rubik.variable} ${cormorant.variable}`}
    >
      <body className="antialiased">
        <NextIntlClientProvider>
          <CustomCursor />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
