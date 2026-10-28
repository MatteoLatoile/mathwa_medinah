import {
  Plus,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

import PocketListings, {
  type PocketListing,
} from "@/components/pocket/PocketListings";

export const dynamic =
  "force-dynamic";

export default async function PocketListingsPage({
  params,
}: {
  params:
    Promise<{
      locale: string;
    }>;
}) {
  const {
    locale,
  } =
    await params;

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("listings")
      .select(`
        id,
        reference,
        title_fr,
        district,
        status,
        monthly_price,
        yearly_price,
        bedrooms,
        bathrooms,
        furnished,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  const listings =
    (data ??
      []) as PocketListing[];

  return (
    <div>
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-green-700">
            Mathwa Pocket
          </p>

          <h1 className="mt-1 font-display text-3xl text-ink">
            Annonces
          </h1>
        </div>

        <a
          href={`/${locale}/admin/annonces/nouvelle`}
          aria-label="Ajouter"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-700 text-paper"
        >
          <Plus className="h-5 w-5" />
        </a>
      </header>

      <div className="mt-6">
        <PocketListings
          locale={locale}
          listings={listings}
        />
      </div>
    </div>
  );
}
