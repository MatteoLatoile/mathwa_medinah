import {
  redirect,
} from "next/navigation";

import {
  setRequestLocale,
} from "next-intl/server";

import {
  createClient,
} from "@/lib/supabase/server";

import ProspectsManager, {
  type Prospect,
  type ProspectListing,
} from "@/components/admin/ProspectsManager";

export default async function ProspectsPage({
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
      `/${locale}/admin`
    );
  }

  const {
    data:
      isAdmin,
  } =
    await supabase.rpc(
      "is_admin"
    );

  if (!isAdmin) {
    redirect(
      `/${locale}/admin`
    );
  }

  const [
    prospectsResult,
    listingsResult,
    privateResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "prospects"
        )
        .select(`
          id,
          reference,
          listing_id,
          name,
          phone,
          status,
          visit_at,
          visit_code,
          notes,
          created_at
        `)
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        ),

      /*
       * On charge aussi les annonces louées
       * pour que l'historique des prospects
       * garde les informations après location.
       */
      supabase
        .from(
          "listings"
        )
        .select(`
          id,
          reference,
          district,
          title_fr,
          status,
          created_at
        `)
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        ),

      /*
       * Données privées propriétaire.
       * RLS admin uniquement.
       */
      supabase
        .from(
          "listing_private"
        )
        .select(`
          listing_id,
          owner_name,
          owner_phone,
          owner_whatsapp
        `),
    ]);

  if (
    prospectsResult.error
  ) {
    throw new Error(
      prospectsResult
        .error
        .message
    );
  }

  if (
    listingsResult.error
  ) {
    throw new Error(
      listingsResult
        .error
        .message
    );
  }

  if (
    privateResult.error
  ) {
    throw new Error(
      privateResult
        .error
        .message
    );
  }

  const prospects =
    (
      prospectsResult.data ??
      []
    ) as Prospect[];

  const privateByListingId =
    new Map(
      (
        privateResult.data ??
        []
      ).map(
        (
          row
        ) => [
          row.listing_id,
          row,
        ]
      )
    );

  const listings:
    ProspectListing[] =
    (
      listingsResult.data ??
      []
    ).map(
      (
        listing
      ) => {
        const privateData =
          privateByListingId.get(
            listing.id
          );

        return {
          id:
            listing.id,

          reference:
            listing.reference,

          district:
            listing.district,

          title_fr:
            listing.title_fr,

          status:
            listing.status,

          owner_name:
            privateData?.owner_name ??
            null,

          owner_phone:
            privateData?.owner_phone ??
            null,

          owner_whatsapp:
            privateData?.owner_whatsapp ??
            null,
        };
      }
    );

  return (
    <main className="min-h-screen bg-sand px-5 pb-20 pt-10 sm:px-8">

      <div className="mx-auto max-w-7xl">

        <a
          href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 text-sm font-medium text-green-700 transition hover:text-green-800"
        >
          ← Retour au dashboard
        </a>

        <div className="mt-8">

          <ProspectsManager
            initialProspects={
              prospects
            }
            listings={
              listings
            }
          />

        </div>

      </div>

    </main>
  );
}