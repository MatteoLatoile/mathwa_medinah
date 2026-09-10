import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingsView from "@/components/ListingsView";
import type { Listing } from "@/components/ListingCard";

export default async function ListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Les annonces viendront de Supabase ici.
  // Tant que la table est vide, ListingsView affiche l'état vide.
  const listings: Listing[] = [];

  return <Listings listings={listings} />;
}

function Listings({ listings }: { listings: Listing[] }) {
  const t = useTranslations("listings");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-sand px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-light leading-tight text-ink">
            {t("title")}
          </h1>
          <p className="mt-3 text-[0.95rem] text-ink-soft">{t("lead")}</p>

          <div className="mt-10">
            <ListingsView listings={listings} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
