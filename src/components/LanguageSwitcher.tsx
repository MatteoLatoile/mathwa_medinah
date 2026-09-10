"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeNames, routing, type Locale } from "@/i18n/routing";

export default function LanguageSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const styles =
    tone === "light"
      ? "text-sand/80 hover:text-sand border-sand/25 hover:border-sand/50"
      : "text-ink-soft hover:text-ink border-ink/15 hover:border-ink/35";

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as Locale;
          startTransition(() => {
            router.replace(
              // @ts-expect-error — les params dynamiques sont transmis tels quels
              { pathname, params },
              { locale: next },
            );
          });
        }}
        className={`appearance-none rounded-full border bg-transparent py-1.5 ps-3 pe-8 text-sm transition-colors ${styles} ${
          isPending ? "opacity-50" : ""
        }`}
      >
        {routing.locales.map((l) => (
          <option key={l} value={l} className="bg-paper text-ink">
            {localeNames[l]}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 12 8"
        className="pointer-events-none absolute end-3 h-2 w-3 fill-current opacity-60"
        aria-hidden="true"
      >
        <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </label>
  );
}
