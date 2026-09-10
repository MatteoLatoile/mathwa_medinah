import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { site, whatsappLink } from "@/lib/site";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="bg-green-900 text-sand/70">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/logo-mark.svg" alt="" className="h-9 w-9 rounded-lg" />
              <span className="font-display text-2xl tracking-wide text-sand">
                {site.name}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">{t("tagline")}</p>
          </div>

          <nav className="flex flex-col gap-2 text-sm sm:items-end">
            <Link href="/annonces" className="transition-colors hover:text-sand">
              {nav("listings")}
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-sand"
            >
              {nav("contact")}
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-sand/15 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. {t("rights")}
          </p>
          <Link
            href="/admin"
            className="text-sand/45 underline underline-offset-4 transition-colors hover:text-sand/80"
          >
            {t("admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
