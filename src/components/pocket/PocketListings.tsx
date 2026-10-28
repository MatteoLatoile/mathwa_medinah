"use client";

import {
  Bath,
  Bed,
  ExternalLink,
  Pencil,
  Search,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

export type PocketListing = {
  id: string;
  reference: string | null;
  title_fr: string | null;
  district: string;
  status: string;
  monthly_price: number | null;
  yearly_price: number | null;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  created_at: string;
};

type Props = {
  locale: string;
  listings: PocketListing[];
};

function statusLabel(
  status: string
) {
  switch (status) {
    case "published":
      return "Publiée";

    case "draft":
      return "Brouillon";

    case "rented":
      return "Louée";

    case "archived":
      return "Archivée";

    default:
      return status;
  }
}

function badgeClass(
  status: string
) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800";

    case "draft":
      return "bg-sand-deep text-ink-soft";

    case "rented":
      return "bg-gold/15 text-ink";

    default:
      return "bg-ink/5 text-ink-soft";
  }
}

function formatPrice(
  listing: PocketListing
) {
  if (
    listing.monthly_price !==
    null
  ) {
    return `${Number(
      listing.monthly_price
    ).toLocaleString("fr-FR")} SAR/mois`;
  }

  if (
    listing.yearly_price !==
    null
  ) {
    return `${Number(
      listing.yearly_price
    ).toLocaleString("fr-FR")} SAR/an`;
  }

  return "Prix sur demande";
}

export default function PocketListings({
  locale,
  listings,
}: Props) {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState("all");

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return listings.filter(
        (listing) => {
          if (
            status !== "all" &&
            listing.status !==
              status
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            listing.reference ?? "",
            listing.title_fr ?? "",
            listing.district,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        }
      );
    }, [
      listings,
      search,
      status,
    ]);

  const filters = [
    ["all", "Toutes"],
    ["published", "Publiées"],
    ["draft", "Brouillons"],
    ["rented", "Louées"],
  ];

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Référence, quartier..."
          className="h-[52px] w-full rounded-2xl border border-ink/10 bg-paper ps-11 pe-4 text-base text-ink outline-none focus:border-green-700"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {filters.map(
          ([
            value,
            text,
          ]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setStatus(value)
              }
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold ${
                status === value
                  ? "bg-green-700 text-paper"
                  : "border border-ink/10 bg-paper text-ink-soft"
              }`}
            >
              {text}
            </button>
          )
        )}
      </div>

      <p className="mt-2 text-xs text-ink-soft">
        {filtered.length} annonce
        {filtered.length > 1
          ? "s"
          : ""}
      </p>

      <div className="mt-4 space-y-3">
        {filtered.map(
          (listing) => (
            <article
              key={listing.id}
              className="rounded-[22px] border border-ink/8 bg-paper p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-green-700">
                      {listing.reference ??
                        "Sans référence"}
                    </span>

                    <span
                      className={`rounded-full px-2 py-1 text-[9px] font-semibold ${badgeClass(
                        listing.status
                      )}`}
                    >
                      {statusLabel(
                        listing.status
                      )}
                    </span>
                  </div>

                  <h2 className="mt-2 truncate text-[15px] font-semibold text-ink">
                    {listing.title_fr ||
                      listing.district}
                  </h2>

                  <p className="mt-1 text-xs text-ink-soft">
                    {listing.district}
                  </p>
                </div>

                <p className="shrink-0 text-end text-xs font-semibold text-green-800">
                  {formatPrice(
                    listing
                  )}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-ink-soft">
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  {listing.bedrooms}
                </span>

                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {listing.bathrooms}
                </span>

                {listing.furnished && (
                  <span>
                    Meublé
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href={`/${locale}/admin/annonces/${listing.id}`}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-3 text-xs font-semibold text-paper"
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </a>

                {listing.status ===
                "published" ? (
                  <a
                    href={`/${locale}/annonces/${listing.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/10 px-3 text-xs font-semibold text-ink"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir
                  </a>
                ) : (
                  <div className="flex min-h-11 items-center justify-center rounded-xl bg-sand text-xs text-ink-soft">
                    Non publiée
                  </div>
                )}
              </div>
            </article>
          )
        )}
      </div>
    </div>
  );
}
