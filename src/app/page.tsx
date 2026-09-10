import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { WhatsappIcon, ArchBullet } from "@/components/icons";
import { ARCH_APERTURE, ARCH_APERTURE_VIEWBOX } from "@/lib/arch";
import { whatsappLink } from "@/lib/site";

type Commitment = {
  title: string;
  body: string;
};

type Step = {
  title: string;
  body: string;
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <Home />;
}

function Home() {
  const t = useTranslations();

  const commitments = t.raw("commitments.items") as Commitment[];
  const steps = t.raw("how.steps") as Step[];

  return (
    <>
      <Header overHero />

      <main>
        {/* ---------- HERO ---------- */}

        <section
          style={{
            position: "relative",
            width: "100%",
            minHeight: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "112px 20px 80px",
          }}
        >
          {/* VIDÉO */}

          <video
            src="/video-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="auto"
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              minWidth: "100%",
              minHeight: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              visibility: "visible",
              opacity: 1,
              zIndex: 9999,
              backgroundColor: "#000",
            }}
          />

          {/* ARCHE */}

          <svg
            viewBox={ARCH_APERTURE_VIEWBOX}
            aria-hidden="true"
            style={{
              position: "relative",
              zIndex: 10000,
              height: "26vh",
              minHeight: "150px",
              width: "auto",
              pointerEvents: "none",
            }}
          >
            <defs>
              <linearGradient
                id="archLight"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#F4EFE3"
                />

                <stop
                  offset="45%"
                  stopColor="#E3CB9B"
                />

                <stop
                  offset="100%"
                  stopColor="#C9A362"
                />
              </linearGradient>
            </defs>

            <path
              d={ARCH_APERTURE}
              fill="url(#archLight)"
            />
          </svg>

          {/* CONTENU HERO */}

          <div
            style={{
              position: "relative",
              zIndex: 10000,
              marginTop: "40px",
              width: "100%",
              maxWidth: "672px",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <h1
              className="font-display text-[clamp(2.4rem,7vw,4.25rem)] font-light leading-[1.05]"
              style={{
                color: "#F4EFE3",
                textShadow: "0 2px 20px rgba(0,0,0,0.8)",
              }}
            >
              {t("hero.title")}
            </h1>

            <p
              className="mx-auto mt-6 max-w-lg text-[0.975rem] leading-relaxed"
              style={{
                color: "#F4EFE3",
                textShadow: "0 2px 12px rgba(0,0,0,0.9)",
              }}
            >
              {t("hero.lead")}
            </p>

            <div
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{
                pointerEvents: "auto",
              }}
            >
              <Link
                href="/annonces"
                className="w-full rounded-full bg-sand px-7 py-3 text-sm font-medium text-green-900 transition-colors hover:bg-white sm:w-auto"
              >
                {t("hero.ctaListings")}
              </Link>

              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-sand bg-green-900/80 px-7 py-3 text-sm text-sand sm:w-auto"
              >
                <WhatsappIcon className="h-4 w-4" />

                {t("hero.ctaWhatsapp")}
              </a>
            </div>
          </div>
        </section>

        {/* ---------- ENGAGEMENTS ---------- */}

        <section
          id="engagements"
          className="bg-sand px-5 py-24 sm:px-8 sm:py-32"
        >
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="max-w-xl font-display text-[clamp(1.9rem,4.5vw,3rem)] font-light leading-tight text-ink">
                {t("commitments.title")}
              </h2>

              <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
                {t("commitments.lead")}
              </p>
            </Reveal>

            <ul className="mt-14 grid gap-x-14 gap-y-10 sm:grid-cols-2">
              {commitments.map((item, i) => (
                <Reveal
                  key={item.title}
                  delay={i * 70}
                >
                  <li className="flex gap-4">
                    <ArchBullet className="mt-1 h-5 w-3.5 shrink-0 text-green-700" />

                    <div>
                      <h3 className="text-base font-medium text-ink">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
                        {item.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}

              <Reveal delay={commitments.length * 70}>
                <div className="rounded-2xl border border-ink/10 bg-paper p-6">
                  <p className="text-[0.9rem] leading-relaxed text-ink-soft">
                    {t("closing.body")}
                  </p>

                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-green-700 underline underline-offset-4 transition-colors hover:text-green-500"
                  >
                    <WhatsappIcon className="h-4 w-4" />

                    {t("closing.cta")}
                  </a>
                </div>
              </Reveal>
            </ul>
          </div>
        </section>

        {/* ---------- À QUI ÇA S'ADRESSE ---------- */}

        <section className="bg-sand-deep px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="max-w-lg font-display text-[clamp(1.9rem,4.5vw,3rem)] font-light leading-tight text-ink">
                {t("audience.title")}
              </h2>

              <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
                {t("audience.lead")}
              </p>
            </Reveal>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-ink/10 sm:grid-cols-2">
              {(["students", "families"] as const).map((key, i) => (
                <Reveal
                  key={key}
                  delay={i * 90}
                >
                  <div className="h-full bg-sand p-8">
                    <h3 className="font-display text-2xl font-normal text-ink">
                      {t(`audience.${key}.title`)}
                    </h3>

                    <p className="mt-3 text-[0.9rem] leading-relaxed text-ink-soft">
                      {t(`audience.${key}.body`)}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={180}>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-green-700 px-7 py-3 text-sm font-medium text-paper transition-colors hover:bg-green-800"
              >
                <WhatsappIcon className="h-4 w-4" />

                {t("audience.cta")}
              </a>
            </Reveal>
          </div>
        </section>

        {/* ---------- DÉROULÉ ---------- */}

        <section className="bg-sand px-5 py-24 sm:px-8 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <h2 className="font-display text-[clamp(1.9rem,4.5vw,3rem)] font-light leading-tight text-ink">
                {t("how.title")}
              </h2>
            </Reveal>

            <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              {steps.map((step, i) => (
                <Reveal
                  key={step.title}
                  delay={i * 90}
                >
                  <li className="border-t border-ink/15 pt-5">
                    <span className="font-display text-3xl font-light text-gold">
                      {i + 1}
                    </span>

                    <h3 className="mt-2 text-base font-medium text-ink">
                      {step.title}
                    </h3>

                    <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
                      {step.body}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- DERNIER APPEL ---------- */}

        <section className="bg-green-800 px-5 py-24 text-center sm:px-8 sm:py-28">
          <Reveal>
            <div className="mx-auto max-w-xl">
              <h2 className="font-display text-[clamp(1.8rem,4.5vw,2.75rem)] font-light leading-tight text-sand">
                {t("closing.title")}
              </h2>

              <p className="mt-4 text-[0.95rem] leading-relaxed text-sand/75">
                {t("closing.body")}
              </p>

              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-sand px-7 py-3 text-sm font-medium text-green-900 transition-colors hover:bg-white"
              >
                <WhatsappIcon className="h-4 w-4" />

                {t("closing.cta")}
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}