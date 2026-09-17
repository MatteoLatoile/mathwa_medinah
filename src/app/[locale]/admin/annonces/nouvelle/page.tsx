import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import NewListingForm from "@/components/admin/NewListingForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  const { data: isAdmin } =
    await supabase.rpc("is_admin");

  if (!isAdmin) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-sand px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-5xl">
          <a
            href={`/${locale}/admin`}
            className="text-sm text-ink-soft transition-colors hover:text-green-700"
          >
            ← Tableau de bord
          </a>

          <div className="mt-7">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-green-700">
              Administration
            </p>

            <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-light leading-tight text-ink">
              Ajouter un appartement
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
              Remplis les informations du logement puis
              enregistre-le en brouillon ou publie-le
              directement.
            </p>
          </div>

          <div className="mt-10">
            <NewListingForm locale={locale} />
          </div>
        </div>
      </main>
    </>
  );
}