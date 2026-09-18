"use client";

import {
  ArrowRight,
  Home,
  Search,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

const words = {
  fr: {
    eyebrow: "Page introuvable",
    title: "Cette adresse ne mène à aucun logement.",
    description:
      "La page que vous recherchez a peut-être été déplacée, supprimée ou l’adresse saisie est incorrecte.",
    home: "Retour à l’accueil",
    listings: "Voir les logements",
    code: "Erreur 404",
  },

  en: {
    eyebrow: "Page not found",
    title: "This address doesn’t lead to a property.",
    description:
      "The page you are looking for may have been moved, removed, or the address may be incorrect.",
    home: "Back to home",
    listings: "Browse properties",
    code: "Error 404",
  },

  ar: {
    eyebrow: "الصفحة غير موجودة",
    title: "هذا العنوان لا يؤدي إلى أي سكن.",
    description:
      "قد تكون الصفحة التي تبحث عنها قد نُقلت أو حُذفت، أو ربما يكون العنوان الذي أدخلته غير صحيح.",
    home: "العودة إلى الرئيسية",
    listings: "عرض المساكن",
    code: "خطأ 404",
  },

  ru: {
    eyebrow: "Страница не найдена",
    title: "По этому адресу нет жилья.",
    description:
      "Возможно, страница была перемещена, удалена или адрес введён неверно.",
    home: "На главную",
    listings: "Смотреть жильё",
    code: "Ошибка 404",
  },
};

type Locale =
  keyof typeof words;

export default function NotFound() {
  const pathname =
    usePathname();

  const firstSegment =
    pathname
      ?.split("/")
      .filter(Boolean)[0];

  const locale: Locale =
    firstSegment === "ar" ||
    firstSegment === "en" ||
    firstSegment === "ru" ||
    firstSegment === "fr"
      ? firstSegment
      : "fr";

  const text =
    words[locale];

  const rtl =
    locale === "ar";

  return (
    <main
      dir={
        rtl
          ? "rtl"
          : "ltr"
      }
      className="relative flex min-h-screen flex-col overflow-hidden bg-[#f4efe3] text-[#12211c]"
    >
      {/* HEADER SIMPLE SANS NEXT-INTL */}

      <header className="relative z-20 flex h-20 items-center justify-between border-b border-[#12211c]/10 px-5 sm:px-8">

        <a
          href={`/${locale}`}
          className="font-serif text-2xl font-medium tracking-tight text-[#06392e]"
        >
          Mathwa
        </a>

        <a
          href={`/${locale}/annonces`}
          className="text-sm font-medium text-[#4a5a53] transition hover:text-[#0d6c55]"
        >
          {text.listings}
        </a>

      </header>

      {/* DÉCOR */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-28 h-[430px] w-[430px] rounded-full border border-[#0d6c55]/[0.05]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -right-36 h-[520px] w-[520px] rounded-full border border-[#0d6c55]/[0.06]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 right-[15%] h-40 w-28 rounded-t-full border border-[#0d6c55]/[0.05]"
      />

      {/* CONTENU */}

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:gap-20">

        {/* TEXTE */}

        <div
          className={
            rtl
              ? "text-right"
              : "text-left"
          }
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0d6c55]/10 bg-[#d9ebe4] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#06392e]">

            <span className="h-1.5 w-1.5 rounded-full bg-[#0d6c55]" />

            {text.eyebrow}

          </div>

          <h1 className="mt-7 max-w-3xl font-serif text-[clamp(3rem,8vw,6.4rem)] font-light leading-[0.95] tracking-[-0.035em] text-[#12211c]">
            {text.title}
          </h1>

          <p className="mt-7 max-w-xl text-[0.95rem] leading-7 text-[#4a5a53] sm:text-base">
            {text.description}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">

            <a
              href={`/${locale}`}
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#0d6c55] px-6 py-3.5 text-sm font-medium text-[#fffdf8] transition hover:bg-[#0a5443]"
            >
              <Home
                className="h-4 w-4"
                aria-hidden="true"
              />

              {text.home}
            </a>

            <a
              href={`/${locale}/annonces`}
              className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-[#12211c]/15 bg-[#fffdf8] px-6 py-3.5 text-sm font-medium text-[#12211c] transition hover:border-[#0d6c55]/30 hover:text-[#0d6c55]"
            >
              <Search
                className="h-4 w-4"
                aria-hidden="true"
              />

              {text.listings}

              <ArrowRight
                className={`h-4 w-4 transition-transform ${
                  rtl
                    ? "rotate-180 group-hover:-translate-x-1"
                    : "group-hover:translate-x-1"
                }`}
                aria-hidden="true"
              />

            </a>

          </div>

        </div>

        {/* VISUEL 404 */}

        <div className="relative flex items-center justify-center">

          <div className="relative flex aspect-square w-full max-w-[430px] items-center justify-center">

            <div className="absolute inset-0 rounded-full border border-[#0d6c55]/10" />

            <div className="absolute inset-[8%] rounded-full border border-[#0d6c55]/[0.07]" />

            <div className="absolute inset-[17%] overflow-hidden rounded-[46%_46%_38%_38%/58%_58%_42%_42%] border border-[#0d6c55]/10 bg-[#fffdf8] shadow-[0_30px_80px_rgba(18,33,28,0.07)]">

              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#d9ebe4]/70 to-transparent" />

              <div className="absolute bottom-[-25%] left-1/2 h-[75%] w-[45%] -translate-x-1/2 rounded-t-full border-[12px] border-[#0d6c55]/[0.055]" />

            </div>

            <div className="relative text-center">

              <p className="font-serif text-[clamp(7rem,18vw,12rem)] font-light leading-none tracking-[-0.07em] text-[#0a5443]">
                404
              </p>

              <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-[#4a5a53]">
                {text.code}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* FOOTER SIMPLE */}

      <footer className="relative z-20 border-t border-[#12211c]/10 px-5 py-6 text-center text-xs text-[#4a5a53] sm:px-8">
        Mathwa · Madinah
      </footer>

    </main>
  );
}