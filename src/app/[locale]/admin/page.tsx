import { setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";

/**
 * Espace admin — coquille vide pour l'instant.
 * L'authentification Supabase et le formulaire d'annonce viendront ici.
 */
export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-sand px-5 pt-24">
        <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-paper p-8">
          <h1 className="font-display text-2xl font-normal text-ink">
            Espace admin
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            La connexion Supabase et le formulaire d&apos;annonce viendront ici.
          </p>
        </div>
      </main>
    </>
  );
}
