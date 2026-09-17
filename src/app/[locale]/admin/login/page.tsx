import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import AdminLoginForm from "@/components/AdminLoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginPage({
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

  if (user) {
    const { data: isAdmin } = await supabase.rpc("is_admin");

    if (isAdmin) {
      redirect(`/${locale}/admin`);
    }
  }

  return (
    <>
      <Header />

      <main className="flex min-h-screen items-center justify-center bg-sand px-5 py-32">
        <div className="w-full max-w-md rounded-3xl border border-ink/10 bg-paper p-7 shadow-sm sm:p-10">
          <div className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-green-700">
            Mathwa
          </div>

          <h1 className="font-display text-4xl font-light leading-tight text-ink">
            Espace admin
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Connectez-vous pour gérer les appartements.
          </p>

          <AdminLoginForm locale={locale} />
        </div>
      </main>
    </>
  );
}