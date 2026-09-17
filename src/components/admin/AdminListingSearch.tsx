"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useLocale } from "next-intl";

import { createClient } from "@/lib/supabase/client";

type AdminListingSearchItem = {
  id: string;
  reference: string | null;
  district: string;
  title_fr: string | null;
  status: string;
  monthly_price: number | null;
  yearly_price: number | null;
};

function statusLabel(
  status: string
) {
  switch (status) {
    case "published":
      return "Publié";

    case "draft":
      return "Brouillon";

    case "rented":
      return "Loué";

    case "archived":
      return "Archivé";

    default:
      return status;
  }
}

function statusClass(
  status: string
) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800";

    case "draft":
      return "bg-sand text-ink-soft";

    case "rented":
      return "bg-ink text-paper";

    case "archived":
      return "bg-ink/10 text-ink-soft";

    default:
      return "bg-sand text-ink-soft";
  }
}

export default function AdminListingSearch() {
  const locale =
    useLocale();

  const [
    listings,
    setListings,
  ] =
    useState<
      AdminListingSearchItem[]
    >([]);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      const supabase =
        createClient();

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "listings"
          )
          .select(`
            id,
            reference,
            district,
            title_fr,
            status,
            monthly_price,
            yearly_price
          `)
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          error
        );

        setListings(
          []
        );

        setLoading(
          false
        );

        return;
      }

      setListings(
        (data ??
          []) as AdminListingSearchItem[]
      );

      setLoading(
        false
      );
    }

    load();

    return () => {
      cancelled =
        true;
    };
  }, []);

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return listings;
      }

      return listings.filter(
        (
          listing
        ) => {
          const monthly =
            listing.monthly_price
              ? String(
                  listing.monthly_price
                )
              : "";

          const yearly =
            listing.yearly_price
              ? String(
                  listing.yearly_price
                )
              : "";

          const haystack =
            [
              listing.reference ??
                "",
              listing.district ??
                "",
              listing.title_fr ??
                "",
              listing.status,
              statusLabel(
                listing.status
              ),
              monthly,
              yearly,
            ]
              .join(" ")
              .toLowerCase();

          return haystack.includes(
            query
          );
        }
      );
    }, [
      listings,
      search,
    ]);

  return (
    <div className="relative z-50 w-full">

      <div className="relative">

        {/* LOUPE */}

        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-ink-soft">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path d="m20 20-3.5-3.5" />
          </svg>

        </div>

        <input
          type="text"
          value={search}
          autoComplete="off"
          placeholder="Rechercher une annonce, une référence, un quartier..."
          onFocus={() =>
            setOpen(true)
          }
          onChange={(
            event
          ) => {
            setSearch(
              event.target
                .value
            );

            setOpen(
              true
            );
          }}
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
              "Escape"
            ) {
              setOpen(
                false
              );
            }
          }}
          className="w-full rounded-2xl border border-ink/10 bg-paper py-4 pe-12 ps-12 text-sm text-ink shadow-[0_5px_20px_rgba(18,33,28,0.04)] outline-none transition placeholder:text-ink-soft/60 focus:border-green-700 focus:ring-4 focus:ring-green-700/5"
        />

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch(
                ""
              );

              setOpen(
                true
              );
            }}
            className="absolute inset-y-0 end-0 flex w-12 cursor-pointer items-center justify-center text-xl text-ink-soft transition hover:text-ink"
            aria-label="Effacer"
          >
            ×
          </button>
        )}

      </div>

      {/* LISTE */}

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+10px)] z-[9999] overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-[0_25px_70px_rgba(18,33,28,0.20)]">

          <div className="flex items-center justify-between border-b border-ink/5 bg-sand/40 px-4 py-3">

            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-soft">
              {loading
                ? "Chargement..."
                : `${filtered.length} ${
                    filtered.length ===
                    1
                      ? "annonce"
                      : "annonces"
                  }`}
            </p>

            <button
              type="button"
              onClick={() =>
                setOpen(
                  false
                )
              }
              className="cursor-pointer text-xs text-ink-soft transition hover:text-ink"
            >
              Fermer
            </button>

          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">

            {!loading &&
              filtered.map(
                (
                  listing
                ) => (
                  <Link
                    key={
                      listing.id
                    }
                    href={`/${locale}/admin/annonces/${listing.id}`}
                    onClick={() =>
                      setOpen(
                        false
                      )
                    }
                    className="group flex items-center gap-4 rounded-xl px-3 py-3.5 transition hover:bg-sand"
                  >

                    {/* MINI ICÔNE */}

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xs font-semibold text-green-800 transition group-hover:bg-green-700 group-hover:text-paper">
                      {listing.reference
                        ?.replace(
                          "MTH-",
                          ""
                        )
                        .slice(
                          -3
                        ) ??
                        "M"}
                    </div>

                    {/* INFOS */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <p className="text-sm font-semibold text-ink">
                          {listing.reference ??
                            "Sans référence"}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${statusClass(
                            listing.status
                          )}`}
                        >
                          {statusLabel(
                            listing.status
                          )}
                        </span>

                      </div>

                      <p className="mt-1 truncate text-sm text-green-700">
                        {
                          listing.district
                        }
                      </p>

                      {listing.title_fr && (
                        <p className="mt-0.5 truncate text-xs text-ink-soft">
                          {
                            listing.title_fr
                          }
                        </p>
                      )}

                    </div>

                    {/* PRIX */}

                    <div className="shrink-0 text-end">

                      {listing.monthly_price ? (
                        <>
                          <p className="font-display text-lg font-medium text-ink">
                            {"\u20C1"}{" "}
                            {Number(
                              listing.monthly_price
                            ).toLocaleString(
                              "fr-FR"
                            )}
                          </p>

                          <p className="text-[10px] text-ink-soft">
                            / mois
                          </p>
                        </>
                      ) : listing.yearly_price ? (
                        <>
                          <p className="font-display text-lg font-medium text-ink">
                            {"\u20C1"}{" "}
                            {Number(
                              listing.yearly_price
                            ).toLocaleString(
                              "fr-FR"
                            )}
                          </p>

                          <p className="text-[10px] text-ink-soft">
                            / an
                          </p>
                        </>
                      ) : (
                        <span className="text-xs text-ink-soft">
                          —
                        </span>
                      )}

                    </div>

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4 shrink-0 text-ink/20 transition group-hover:translate-x-1 group-hover:text-green-700"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>

                  </Link>
                )
              )}

            {!loading &&
              filtered.length ===
                0 && (
                <div className="px-6 py-12 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sand">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-5 w-5 text-ink-soft"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                      />

                      <path d="m20 20-3.5-3.5" />
                    </svg>

                  </div>

                  <p className="mt-4 text-sm font-medium text-ink">
                    Aucune annonce trouvée
                  </p>

                  <p className="mt-1 text-xs text-ink-soft">
                    Essaie une référence, un quartier, un titre ou un prix.
                  </p>

                </div>
              )}

          </div>

        </div>
      )}

    </div>
  );
}