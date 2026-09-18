"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
} from "lucide-react";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  Link,
  usePathname,
  useRouter,
} from "@/i18n/navigation";

import {
  site,
  whatsappLink,
} from "@/lib/site";

const languages = [
  {
    code: "fr",
    short: "FR",
    label: "Français",
    flag: "https://flagcdn.com/w80/fr.png",
  },
  {
    code: "ar",
    short: "AR",
    label: "العربية",
    flag: "https://flagcdn.com/w80/sa.png",
  },
  {
    code: "en",
    short: "EN",
    label: "English",
    flag: "https://flagcdn.com/w80/gb.png",
  },
  {
    code: "ru",
    short: "RU",
    label: "Русский",
    flag: "https://flagcdn.com/w80/ru.png",
  },
] as const;

type Locale =
  (typeof languages)[number]["code"];

function WhatsAppIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M16.003 3C8.833 3 3 8.718 3 15.75c0 2.248.598 4.442 1.734 6.37L3 29l7.066-1.802A13.11 13.11 0 0 0 16.003 28C23.17 28 29 22.282 29 15.25 29 8.718 23.17 3 16.003 3Zm0 22.832a10.94 10.94 0 0 1-5.576-1.52l-.4-.234-4.193 1.068 1.12-4.035-.26-.413a10.52 10.52 0 0 1-1.62-5.448c0-5.847 4.9-10.605 10.93-10.605 6.026 0 10.93 4.758 10.93 10.605 0 5.844-4.904 10.582-10.93 10.582Zm5.993-7.93c-.328-.16-1.94-.93-2.24-1.04-.3-.106-.52-.16-.738.16-.22.32-.85 1.04-1.04 1.254-.19.214-.382.24-.71.08-.327-.16-1.383-.495-2.635-1.58-.974-.84-1.632-1.88-1.823-2.2-.19-.32-.02-.493.143-.652.147-.143.328-.373.492-.56.164-.186.218-.32.328-.533.11-.214.055-.4-.028-.56-.082-.16-.738-1.733-1.012-2.373-.266-.64-.538-.553-.738-.563l-.63-.01c-.22 0-.575.08-.876.4-.3.32-1.15 1.093-1.15 2.666 0 1.573 1.177 3.093 1.34 3.306.164.214 2.316 3.44 5.61 4.823.784.33 1.395.526 1.873.673.787.243 1.503.21 2.07.127.632-.092 1.94-.773 2.214-1.52.273-.747.273-1.387.19-1.52-.08-.133-.3-.213-.628-.373Z" />
    </svg>
  );
}

export default function Header({
  overHero = false,
}: {
  overHero?: boolean;
}) {
  const t =
    useTranslations("nav");

  const locale =
    useLocale() as Locale;

  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    solid,
    setSolid,
  ] = useState(!overHero);

  const [
    languageOpen,
    setLanguageOpen,
  ] = useState(false);

  const languageRef =
    useRef<HTMLDivElement>(
      null
    );

  const currentLanguage =
    languages.find(
      (language) =>
        language.code ===
        locale
    ) ?? languages[0];

  useEffect(() => {
    if (!overHero) {
      return;
    }

    const onScroll = () =>
      setSolid(
        window.scrollY > 40
      );

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      );
  }, [overHero]);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        languageRef.current &&
        !languageRef.current.contains(
          event.target as Node
        )
      ) {
        setLanguageOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  function changeLanguage(
    newLocale: Locale
  ) {
    setLanguageOpen(false);

    router.replace(
      pathname,
      {
        locale: newLocale,
      }
    );
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid
          ? "border-b border-white/[0.06] bg-green-900/95 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">

        {/* LOGO */}

        <Link
          href="/"
          className="flex items-center gap-2.5"
        >
          <img
            src="/logo-mark.svg"
            alt=""
            className="h-8 w-8 rounded-lg"
          />

          <span className="font-display text-xl tracking-wide text-sand">
            {site.name}
          </span>
        </Link>

        {/* NAV */}

        <nav className="flex items-center gap-2 sm:gap-4">

          <Link
            href="/annonces"
            className="hidden text-sm text-sand/80 transition-colors hover:text-sand sm:block"
          >
            {t("listings")}
          </Link>

          {/* LANGUES */}

          <div
            ref={languageRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setLanguageOpen(
                  (current) =>
                    !current
                )
              }
              aria-expanded={
                languageOpen
              }
              aria-label="Changer de langue"
              className="group flex h-10 items-center gap-2 rounded-full border border-sand/15 bg-white/[0.07] px-2.5 text-sand shadow-sm backdrop-blur-md transition-all duration-200 hover:border-sand/30 hover:bg-white/[0.12] sm:px-3"
            >

              <span className="relative h-[20px] w-[28px] shrink-0 overflow-hidden rounded-[4px] shadow-sm ring-1 ring-white/20">
                <img
                  src={
                    currentLanguage.flag
                  }
                  alt={
                    currentLanguage.label
                  }
                  className="h-full w-full object-cover"
                />
              </span>

              <span className="hidden text-xs font-semibold tracking-[0.08em] sm:inline">
                {
                  currentLanguage.short
                }
              </span>

              <ChevronDown
                className={`h-3.5 w-3.5 text-sand/60 transition-transform duration-200 ${
                  languageOpen
                    ? "rotate-180"
                    : ""
                }`}
              />

            </button>

            {/* MENU LANGUES */}

            <div
              className={`absolute top-[calc(100%+10px)] z-[100] min-w-[200px] overflow-hidden rounded-2xl border border-ink/10 bg-paper p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition-all duration-200 ${
                locale === "ar"
                  ? "left-0"
                  : "right-0"
              } ${
                languageOpen
                  ? "visible translate-y-0 scale-100 opacity-100"
                  : "invisible -translate-y-2 scale-[0.98] opacity-0"
              }`}
            >

              {languages.map(
                (language) => {
                  const active =
                    language.code ===
                    locale;

                  return (
                    <button
                      key={
                        language.code
                      }
                      type="button"
                      onClick={() =>
                        changeLanguage(
                          language.code
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        active
                          ? "bg-green-100 text-green-900"
                          : "text-ink hover:bg-sand"
                      }`}
                    >

                      <span className="relative h-[24px] w-[34px] shrink-0 overflow-hidden rounded-[5px] shadow-sm ring-1 ring-ink/10">
                        <img
                          src={
                            language.flag
                          }
                          alt={
                            language.label
                          }
                          className="h-full w-full object-cover"
                        />
                      </span>

                      <div
                        className={`min-w-0 flex-1 ${
                          language.code ===
                          "ar"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        <p className="text-sm font-medium">
                          {
                            language.label
                          }
                        </p>
                      </div>

                      {active && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-700 text-paper">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}

                    </button>
                  );
                }
              )}

            </div>
          </div>

          {/* WHATSAPP */}

          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm font-medium text-green-900 transition-all duration-200 hover:bg-white hover:shadow-lg"
          >
            <WhatsAppIcon className="h-[18px] w-[18px] text-[#25D366] transition-transform duration-200 group-hover:scale-110" />

            <span>
              {t("contact")}
            </span>
          </a>

        </nav>

      </div>
    </header>
  );
}