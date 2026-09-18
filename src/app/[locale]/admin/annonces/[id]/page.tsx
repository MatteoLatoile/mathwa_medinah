import {
  notFound,
  redirect,
} from "next/navigation";

import {
  setRequestLocale,
} from "next-intl/server";

import Header from "@/components/Header";

import EditListingForm from "@/components/admin/EditListingForm";
import ListingPhotosManager from "@/components/admin/ListingPhotosManager";
import ListingVideoManager from "@/components/admin/ListingVideoManager";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  getR2PublicUrl,
} from "@/lib/r2";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}) {
  const {
    locale,
    id,
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

  const {
    data:
      listing,
    error:
      listingError,
  } =
    await supabase
      .from(
        "listings"
      )
      .select(`
        id,
        reference,

        title_fr,
        title_ar,
        title_en,
        title_ru,

        description_fr,
        description_ar,
        description_en,
        description_ru,

        district,
        location_label,

        property_type,
        occupancy_type,
        nabawi_distance_km,

        bedrooms,
        bathrooms,
        living_rooms,

        floor,
        area_m2,

        monthly_price,
        yearly_price,
        deposit,

        furnished,

        water_included,
        electricity_included,
        internet_included,
        cleaning_included,

        air_conditioning,
        elevator,
        parking,
        kitchen,

        verified,
        featured,

        video_path,

        status
      `)
      .eq(
        "id",
        id
      )
      .single();

  if (
    listingError ||
    !listing
  ) {
    notFound();
  }

  const {
    data:
      privateData,
    error:
      privateError,
  } =
    await supabase
      .from(
        "listing_private"
      )
      .select(`
        exact_address,

        owner_name,
        owner_phone,
        owner_whatsapp,
        owner_notes,

        commission_type,
        commission_value,

        private_notes
      `)
      .eq(
        "listing_id",
        id
      )
      .maybeSingle();

  if (
    privateError
  ) {
    throw new Error(
      privateError.message
    );
  }

  const {
    data:
      imagesData,
    error:
      imagesError,
  } =
    await supabase
      .from(
        "listing_images"
      )
      .select(`
        id,
        storage_path,
        position,
        is_cover
      `)
      .eq(
        "listing_id",
        id
      )
      .order(
        "position",
        {
          ascending:
            true,
        }
      );

  if (
    imagesError
  ) {
    throw new Error(
      imagesError.message
    );
  }

  const initialImages =
    (
      imagesData ??
      []
    ).map(
      (
        image
      ) => {
        const {
          data:
            publicUrlData,
        } =
          supabase.storage
            .from(
              "listing-images"
            )
            .getPublicUrl(
              image.storage_path
            );

        return {
          id:
            image.id,

          storage_path:
            image.storage_path,

          position:
            image.position,

          is_cover:
            image.is_cover,

          publicUrl:
            publicUrlData.publicUrl,
        };
      }
    );

  const initialVideoUrl =
    listing.video_path
      ? getR2PublicUrl(
          listing.video_path
        )
      : null;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-sand px-5 pb-24 pt-28 sm:px-8 sm:pt-32">

        <div className="mx-auto max-w-5xl">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <a
              href={`/${locale}/admin`}
              className="inline-flex items-center gap-2 text-sm font-medium text-green-700 transition hover:text-green-800"
            >
              ← Retour au dashboard
            </a>

            {listing.status ===
              "published" && (

              <a
                href={`/${locale}/annonces/${listing.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-green-700/20 bg-green-100 px-5 py-2.5 text-sm font-medium text-green-800 transition hover:bg-green-700 hover:text-paper"
              >
                Voir l&apos;annonce
              </a>

            )}

          </div>

          <header className="mt-8">

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">
              {listing.reference}
            </p>

            <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,4rem)] font-light leading-tight text-ink">
              Modifier l&apos;annonce
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">

              <span className="text-sm text-ink-soft">
                {listing.district}
              </span>

              <span className="text-ink/20">
                •
              </span>

              <span
                className={
                  listing.status ===
                  "published"
                    ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                    : listing.status ===
                        "rented"
                      ? "rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-ink"
                      : listing.status ===
                          "archived"
                        ? "rounded-full bg-ink/10 px-3 py-1 text-xs font-medium text-ink-soft"
                        : "rounded-full bg-paper px-3 py-1 text-xs font-medium text-ink-soft"
                }
              >
                {listing.status ===
                "published"
                  ? "Publiée"
                  : listing.status ===
                      "rented"
                    ? "Louée"
                    : listing.status ===
                        "archived"
                      ? "Archivée"
                      : "Brouillon"}
              </span>

            </div>

          </header>

          <div className="mt-10">

            <ListingPhotosManager
              listingId={
                listing.id
              }
              initialImages={
                initialImages
              }
            />

          </div>

          <div className="mt-8">

            <ListingVideoManager
              listingId={
                listing.id
              }
              initialVideoPath={
                listing.video_path
              }
              initialVideoUrl={
                initialVideoUrl
              }
            />

          </div>

          <div className="mt-8">

            <EditListingForm
              locale={
                locale
              }
              listing={
                listing
              }
              privateData={
                privateData
              }
            />

          </div>

        </div>

      </main>
    </>
  );
}