import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  if (!hasLocale(routing.locales, requested)) {
    notFound();
  }

  const locale = requested;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});