import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingsView from "@/components/ListingsView";

import type { Listing } from "@/components/ListingCard";

import { createClient } from "@/lib/supabase/server";

type ListingImageRow = {
  id: string;
  listing_id: string;
  storage_path: string;
  position: number;
  is_cover: boolean;
};

export default async function ListingsPage({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const supabase =
    await createClient();

  const {
    data: rows,
    error: listingsError,
  } = await supabase
    .from("listings")
    .select(`
      id,
      reference,

      title_fr,
      title_ar,
      title_en,
      title_ru,

      district,

      monthly_price,
      yearly_price,

      bedrooms,
      bathrooms,
      floor,

      verified,
      status,

      created_at
    `)
    .eq(
      "status",
      "published"
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (listingsError) {
    console.error(
      "Erreur récupération annonces :",
      listingsError
    );
  }

  const listingRows =
    rows ?? [];

  const listingIds =
    listingRows.map(
      (listing) =>
        listing.id
    );

  const coverPhotos =
    new Map<
      string,
      string
    >();

  if (
    listingIds.length > 0
  ) {
    const {
      data: imageRows,
      error: imagesError,
    } = await supabase
      .from(
        "listing_images"
      )
      .select(`
        id,
        listing_id,
        storage_path,
        position,
        is_cover
      `)
      .in(
        "listing_id",
        listingIds
      )
      .order(
        "position",
        {
          ascending: true,
        }
      );

    if (imagesError) {
      console.error(
        "Erreur récupération photos :",
        imagesError
      );
    }

    const images =
      (imageRows ??
        []) as ListingImageRow[];

    const imagesByListing =
      new Map<
        string,
        ListingImageRow[]
      >();

    for (
      const image of images
    ) {
      const existing =
        imagesByListing.get(
          image.listing_id
        ) ?? [];

      existing.push(
        image
      );

      imagesByListing.set(
        image.listing_id,
        existing
      );
    }

    for (
      const listingId of
      listingIds
    ) {
      const listingImages =
        imagesByListing.get(
          listingId
        ) ?? [];

      if (
        listingImages.length ===
        0
      ) {
        continue;
      }

      const coverImage =
        listingImages.find(
          (image) =>
            image.is_cover
        ) ??
        listingImages[0];

      const {
        data:
          publicUrlData,
      } =
        supabase.storage
          .from(
            "listing-images"
          )
          .getPublicUrl(
            coverImage.storage_path
          );

      coverPhotos.set(
        listingId,
        publicUrlData.publicUrl
      );
    }
  }

  const listings: Listing[] =
    listingRows.map(
      (row) => {
        const title =
          locale === "ar"
            ? row.title_ar ||
              row.title_fr ||
              row.title_en
            : locale === "en"
              ? row.title_en ||
                row.title_fr
              : locale === "ru"
                ? row.title_ru ||
                  row.title_fr
                : row.title_fr ||
                  row.title_en;

        const monthly =
          row.monthly_price !==
            null &&
          row.monthly_price !==
            undefined;

        return {
          id: row.id,

          title:
            title ||
            row.reference ||
            "Appartement",

          district:
            row.district,

          price: monthly
            ? Number(
                row.monthly_price
              )
            : Number(
                row.yearly_price ??
                  0
              ),

          period: monthly
            ? "month"
            : "year",

          rooms:
            Number(
              row.bedrooms ??
                0
            ),

          bathrooms:
            Number(
              row.bathrooms ??
                0
            ),

          floor:
            row.floor ===
              null ||
            row.floor ===
              undefined
              ? "—"
              : String(
                  row.floor
                ),

          verified:
            row.verified ??
            false,

          rented: false,

          photo:
            coverPhotos.get(
              row.id
            ),
        };
      }
    );

  return (
    <Listings
      listings={
        listings
      }
    />
  );
}

function Listings({
  listings,
}: {
  listings: Listing[];
}) {
  const t =
    useTranslations(
      "listings"
    );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-sand px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-light leading-tight text-ink">
            {t("title")}
          </h1>

          <p className="mt-3 text-[0.95rem] text-ink-soft">
            {t("lead")}
          </p>

          <p className="mt-4 text-sm text-ink-soft">
            {t("count", {
              count:
                listings.length,
            })}
          </p>

          <div className="mt-10">
            <ListingsView
              listings={
                listings
              }
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}