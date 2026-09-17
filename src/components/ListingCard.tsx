import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  Bath,
  Bed,
  Layers,
  MapPin,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";

import {
  Link,
} from "@/i18n/navigation";

import {
  ArchBullet,
} from "./icons";

export type Listing = {
  id: string;
  title: string;

  /*
   * Nom INTERNE du quartier.
   * Ne pas traduire ici.
   */
  district: string;

  price: number;

  period:
    | "month"
    | "year";

  rooms: number;
  bathrooms: number;
  floor: string;

  verified: boolean;
  rented: boolean;

  photo?: string;
};

export default function ListingCard({
  listing,
  districtLabel,
}: {
  listing: Listing;

  /*
   * Nom traduit affiché au visiteur.
   */
  districtLabel?: string;
}) {
  const t =
    useTranslations(
      "badges"
    );

  const locale =
    useLocale();

  const localeFormat =
    locale === "fr"
      ? "fr-FR"
      : locale === "ar"
        ? "ar-SA"
        : locale === "ru"
          ? "ru-RU"
          : "en-US";

  const displayedDistrict =
    districtLabel ||
    listing.district;

  return (
    <Link
      href={`/annonces/${listing.id}`}
      className={`group block overflow-hidden rounded-2xl border border-ink/10 bg-paper transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(18,33,28,0.10)] ${
        listing.rented
          ? "opacity-60"
          : ""
      }`}
    >

      {/* PHOTO */}

      <div className="relative aspect-[4/3] overflow-hidden bg-sand-deep">

        {listing.photo ? (

          <img
            src={
              listing.photo
            }
            alt={
              listing.title
            }
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
            loading="lazy"
          />

        ) : (

          <div className="flex h-full items-center justify-center">

            <ArchBullet className="h-10 w-7 text-ink/15" />

          </div>

        )}

        {/* VOILE BAS */}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />

        {/* BADGE */}

        <span
          className={`absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-sm ${
            listing.rented
              ? "bg-ink/70 text-sand"
              : listing.verified
                ? "bg-green-100/95 text-green-800"
                : "bg-paper/90 text-ink-soft"
          }`}
        >

          {listing.rented ? (

            t(
              "rented"
            )

          ) : listing.verified ? (

            <>
              <ShieldCheck
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              {t(
                "verified"
              )}
            </>

          ) : (

            <>
              <ShieldQuestion
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              {t(
                "notVerified"
              )}
            </>

          )}

        </span>

      </div>

      {/* CONTENU */}

      <div className="p-5">

        <h3 className="text-base font-medium leading-snug text-ink">

          {
            listing.title
          }

        </h3>

        {/* QUARTIER TRADUIT */}

        <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-ink-soft">

          <MapPin
            className="h-3.5 w-3.5 shrink-0 text-green-700/70"
            aria-hidden="true"
          />

          {
            displayedDistrict
          }

        </p>

        {/* INFORMATIONS */}

        <div className="mt-4 flex items-center gap-4 border-t border-ink/8 pt-4 text-sm text-ink-soft">

          <span className="inline-flex items-center gap-1.5">

            <Bed
              className="h-4 w-4 text-ink-soft/70"
              aria-hidden="true"
            />

            {
              listing.rooms
            }

          </span>

          <span className="inline-flex items-center gap-1.5">

            <Bath
              className="h-4 w-4 text-ink-soft/70"
              aria-hidden="true"
            />

            {
              listing.bathrooms
            }

          </span>

          <span className="inline-flex items-center gap-1.5">

            <Layers
              className="h-4 w-4 text-ink-soft/70"
              aria-hidden="true"
            />

            {
              listing.floor
            }

          </span>

        </div>

        {/* PRIX */}

        <p className="mt-4 flex items-baseline gap-1 border-t border-ink/8 pt-4 font-display text-2xl font-medium text-green-700">

          <span aria-hidden="true">
            {"\u20C1"}
          </span>

          <span>
            {listing.price.toLocaleString(
              localeFormat
            )}
          </span>

          <span className="font-sans text-sm font-normal text-ink-soft">

            {listing.period ===
            "month"
              ? t(
                  "perMonth"
                )
              : t(
                  "perYear"
                )}

          </span>

        </p>

      </div>

    </Link>
  );
}