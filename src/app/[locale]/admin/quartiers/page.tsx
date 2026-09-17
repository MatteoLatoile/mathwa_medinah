import {
  redirect,
} from "next/navigation";

import {
  setRequestLocale,
} from "next-intl/server";

import Header from "@/components/Header";
import DistrictManager from "@/components/admin/DistrictManager";

import {
  createClient,
} from "@/lib/supabase/server";

export default async function DistrictsAdminPage({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const {
    locale,
  } =
    await params;

  setRequestLocale(
    locale
  );

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/${locale}/admin/login`
    );
  }

  const {
    data: isAdmin,
  } =
    await supabase.rpc(
      "is_admin"
    );

  if (!isAdmin) {
    redirect(
      `/${locale}/admin`
    );
  }

  const {
    data: districts,
    error,
  } =
    await supabase
      .from(
        "districts"
      )
      .select(`
        id,
        name,
        name_fr,
        name_ar,
        name_en,
        name_ru,
        latitude,
        longitude,
        active,
        sort_order
      `)
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      )
      .order(
        "name",
        {
          ascending:
            true,
        }
      );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-sand px-5 pb-24 pt-28 sm:px-8 sm:pt-32">

        <div className="mx-auto max-w-7xl">

          <a
            href={`/${locale}/admin`}
            className="text-sm font-medium text-green-700 transition hover:text-green-800"
          >
            ← Retour au tableau de bord
          </a>

          <div className="mt-6">

            <p className="text-xs font-medium uppercase tracking-[0.16em] text-green-700">
              Administration
            </p>

            <h1 className="mt-2 font-display text-[clamp(2.3rem,5vw,3.8rem)] font-light leading-tight text-ink">
              Quartiers
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
              Gère les noms traduits et la position approximative utilisée sur la carte publique.
            </p>

          </div>

          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error.message}
            </div>
          )}

          <div className="mt-10">

            <DistrictManager
              initialDistricts={
                districts ??
                []
              }
            />

          </div>

        </div>

      </main>
    </>
  );
}