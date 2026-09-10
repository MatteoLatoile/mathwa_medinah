"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { site, whatsappLink } from "@/lib/site";

/**
 * En-tête transparent au-dessus du hero, puis fond plein dès qu'on défile.
 * `overHero` vaut false sur les pages sans hero sombre.
 */
export default function Header({ overHero = false }: { overHero?: boolean }) {
  const t = useTranslations("nav");
  const [solid, setSolid] = useState(!overHero);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? "bg-green-900/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo-mark.svg" alt="" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-xl tracking-wide text-sand">
            {site.name}
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-5">
          <Link
            href="/annonces"
            className="hidden text-sm text-sand/85 transition-colors hover:text-sand sm:block"
          >
            {t("listings")}
          </Link>
          <LanguageSwitcher tone="light" />
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-sand px-4 py-1.5 text-sm font-medium text-green-900 transition-colors hover:bg-white"
          >
            {t("contact")}
          </a>
        </nav>
      </div>
    </header>
  );
}
