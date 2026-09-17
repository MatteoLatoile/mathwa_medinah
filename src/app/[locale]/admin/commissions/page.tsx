import {
  redirect,
} from "next/navigation";

import {
  setRequestLocale,
} from "next-intl/server";

import {
  createClient,
} from "@/lib/supabase/server";

import CommissionsManager, {
  type CommissionItem,
  type CommissionStatus,
} from "@/components/admin/CommissionsManager";

export default async function CommissionsPage({
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

  if (
    !isAdmin
  ) {
    redirect(
      `/${locale}/admin`
    );
  }

  const [
    listingsResult,
    privateResult,
    prospectsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "listings"
        )
        .select(`
          id,
          reference,
          title_fr,
          district,
          status
        `)
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        ),

      supabase
        .from(
          "listing_private"
        )
        .select(`
          listing_id,
          owner_name,
          owner_phone,
          owner_whatsapp,
          commission_type,
          commission_value,
          commission_status
        `),

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
          updated_at
        `)
        .eq(
          "status",
          "rented"
        )
        .order(
          "updated_at",
          {
            ascending:
              false,
          }
        ),
    ]);

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

  if (
    prospectsResult.error
  ) {
    throw new Error(
      prospectsResult
        .error
        .message
    );
  }

  const listings =
    listingsResult.data ??
    [];

  const privateRows =
    privateResult.data ??
    [];

  const rentedProspects =
    prospectsResult.data ??
    [];

  const listingById =
    new Map(
      listings.map(
        (
          listing
        ) => [
          listing.id,
          listing,
        ]
      )
    );

  /*
   * Comme les prospects sont triés
   * du plus récent au plus ancien,
   * le premier trouvé pour une annonce
   * est considéré comme le locataire actuel.
   */
  const rentedProspectByListing =
    new Map<
      string,
      (
        typeof rentedProspects
      )[number]
    >();

  for (
    const prospect
    of rentedProspects
  ) {
    if (
      prospect.listing_id &&
      !rentedProspectByListing.has(
        prospect.listing_id
      )
    ) {
      rentedProspectByListing.set(
        prospect.listing_id,
        prospect
      );
    }
  }

  const commissions:
    CommissionItem[] =
    privateRows
      /*
       * On affiche uniquement les logements
       * où une commission a été définie.
       */
      .filter(
        (
          privateData
        ) =>
          privateData.commission_value !==
            null ||
          privateData.commission_type !==
            null
      )
      .map(
        (
          privateData
        ) => {
          const listing =
            listingById.get(
              privateData.listing_id
            );

          const prospect =
            rentedProspectByListing.get(
              privateData.listing_id
            );

          return {
            listing_id:
              privateData.listing_id,

            listing_reference:
              listing?.reference ??
              null,

            listing_title:
              listing?.title_fr ??
              null,

            district:
              listing?.district ??
              null,

            owner_name:
              privateData.owner_name ??
              null,

            owner_phone:
              privateData.owner_phone ??
              null,

            owner_whatsapp:
              privateData.owner_whatsapp ??
              null,

            commission_type:
              privateData.commission_type ??
              null,

            commission_value:
              privateData.commission_value ===
                null
                ? null
                : Number(
                    privateData.commission_value
                  ),

            commission_status:
              privateData.commission_status as CommissionStatus | null,

            prospect_id:
              prospect?.id ??
              null,

            prospect_reference:
              prospect?.reference ??
              null,

            prospect_name:
              prospect?.name ??
              null,

            prospect_phone:
              prospect?.phone ??
              null,

            rented_at:
              prospect?.updated_at ??
              null,
          };
        }
      );

  return (
    <main className="min-h-screen bg-sand px-5 pb-20 pt-10 sm:px-8">

      <div className="mx-auto max-w-7xl">

        <div className="flex flex-wrap items-center gap-4">

          <a
            href={`/${locale}/admin`}
            className="text-sm font-medium text-green-700 transition hover:text-green-800"
          >
            ← Dashboard
          </a>

          <a
            href={`/${locale}/admin/prospects`}
            className="text-sm font-medium text-ink-soft transition hover:text-green-700"
          >
            Prospects & visites
          </a>

        </div>

        <div className="mt-8">

          <CommissionsManager
            initialCommissions={
              commissions
            }
          />

        </div>

      </div>

    </main>
  );
}