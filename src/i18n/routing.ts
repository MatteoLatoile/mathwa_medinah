import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "ar", "en", "ru"],
  defaultLocale: "fr",
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
  en: "English",
  ru: "Русский",
};

export const rtlLocales: Locale[] = ["ar"];
