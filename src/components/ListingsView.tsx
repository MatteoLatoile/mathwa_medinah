"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import FilterBar, {
  type DistrictOption,
  type FilterValues,
} from "./FilterBar";

import ListingCard, {
  type Listing,
} from "./ListingCard";

import ListingsMap from "./ListingsMap";

import {
  ArchBullet,
  WhatsappIcon,
} from "./icons";

import {
  whatsappLink,
} from "@/lib/site";

import {
  createClient,
} from "@/lib/supabase/client";

type District = {
  id: string;
  name: string;

  name_fr: string | null;
  name_ar: string | null;
  name_en: string | null;
  name_ru: string | null;

  active: boolean;
  sort_order: number;
};

const INITIAL_FILTERS: FilterValues = {
  district: "",
  priceMin: "",
  priceMax: "",
  period: "all",
  rooms: "",
  bathrooms: "",
};

export default function ListingsView({
  listings,
}: {
  listings: Listing[];
}) {
  const t =
    useTranslations(
      "listings"
    );

  const locale =
    useLocale();

  const [
    view,
    setView,
  ] =
    useState<
      "list" | "map"
    >(
      "list"
    );

  const [
    filters,
    setFilters,
  ] =
    useState<FilterValues>(
      INITIAL_FILTERS
    );

  const [
    districts,
    setDistricts,
  ] =
    useState<District[]>(
      []
    );

  /* =========================================
     CHARGEMENT DES QUARTIERS TRADUITS
  ========================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function loadDistricts() {
      const supabase =
        createClient();

      const {
        data,
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
            active,
            sort_order
          `)
          .eq(
            "active",
            true
          )
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

      if (
        cancelled
      ) {
        return;
      }

      if (
        error
      ) {
        console.error(
          "Erreur chargement quartiers :",
          error
        );

        setDistricts(
          []
        );

        return;
      }

      setDistricts(
        (data ??
          []) as District[]
      );
    }

    loadDistricts();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* =========================================
     NOM TRADUIT DU QUARTIER
  ========================================= */

  function getDistrictLabel(
    internalName:
      string
  ) {
    const district =
      districts.find(
        (
          item
        ) =>
          normalizeDistrict(
            item.name
          ) ===
          normalizeDistrict(
            internalName
          )
      );

    if (
      !district
    ) {
      return internalName;
    }

    if (
      locale ===
      "ar"
    ) {
      return (
        district.name_ar ||
        district.name_fr ||
        district.name_en ||
        district.name
      );
    }

    if (
      locale ===
      "en"
    ) {
      return (
        district.name_en ||
        district.name_fr ||
        district.name
      );
    }

    if (
      locale ===
      "ru"
    ) {
      return (
        district.name_ru ||
        district.name_fr ||
        district.name_en ||
        district.name
      );
    }

    return (
      district.name_fr ||
      district.name
    );
  }

  /* =========================================
     QUARTIERS UTILISÉS PAR LES ANNONCES
  ========================================= */

  const districtOptions =
    useMemo<
      DistrictOption[]
    >(
      () => {
        const internalNames =
          Array.from(
            new Set(
              listings
                .map(
                  (
                    listing
                  ) =>
                    listing.district
                )
                .filter(
                  Boolean
                )
            )
          );

        return internalNames
          .map(
            (
              internalName
            ) => ({
              value:
                internalName,

              label:
                getDistrictLabel(
                  internalName
                ),
            })
          )
          .sort(
            (
              a,
              b
            ) =>
              a.label.localeCompare(
                b.label,
                locale
              )
          );
      },
      [
        listings,
        districts,
        locale,
      ]
    );

  /* =========================================
     FILTRAGE
  ========================================= */

  const filteredListings =
    useMemo(
      () => {
        return listings.filter(
          (
            listing
          ) => {
            if (
              filters.district &&
              normalizeDistrict(
                listing.district
              ) !==
                normalizeDistrict(
                  filters.district
                )
            ) {
              return false;
            }

            if (
              filters.period !==
                "all" &&
              listing.period !==
                filters.period
            ) {
              return false;
            }

            const min =
              filters.priceMin
                ? Number(
                    filters.priceMin
                  )
                : null;

            const max =
              filters.priceMax
                ? Number(
                    filters.priceMax
                  )
                : null;

            if (
              min !== null &&
              listing.price <
                min
            ) {
              return false;
            }

            if (
              max !== null &&
              listing.price >
                max
            ) {
              return false;
            }

            if (
              filters.rooms
            ) {
              if (
                filters.rooms ===
                "6+"
              ) {
                if (
                  listing.rooms <
                  6
                ) {
                  return false;
                }
              } else if (
                listing.rooms !==
                Number(
                  filters.rooms
                )
              ) {
                return false;
              }
            }

            if (
              filters.bathrooms
            ) {
              if (
                filters.bathrooms ===
                "5+"
              ) {
                if (
                  listing.bathrooms <
                  5
                ) {
                  return false;
                }
              } else if (
                listing.bathrooms !==
                Number(
                  filters.bathrooms
                )
              ) {
                return false;
              }
            }

            return true;
          }
        );
      },
      [
        listings,
        filters,
      ]
    );

  function resetFilters() {
    setFilters(
      INITIAL_FILTERS
    );
  }

  /* =========================================
     AUCUNE ANNONCE
  ========================================= */

  if (
    listings.length ===
    0
  ) {
    return (
      <>
        <FilterBar
          filters={
            filters
          }
          districts={
            districtOptions
          }
          view={
            view
          }
          onFiltersChange={
            setFilters
          }
          onViewChange={
            setView
          }
        />

        <div className="mt-8 rounded-2xl border border-dashed border-ink/20 px-6 py-16 text-center">

          <ArchBullet className="mx-auto h-9 w-6 text-ink/20" />

          <h2 className="mt-6 font-display text-2xl font-normal text-ink">
            {t(
              "empty.title"
            )}
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-[0.9rem] leading-relaxed text-ink-soft">
            {t(
              "empty.body"
            )}
          </p>

          <a
            href={
              whatsappLink()
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-paper transition hover:bg-green-800"
          >

            <WhatsappIcon className="h-4 w-4" />

            {t(
              "empty.cta"
            )}

          </a>

        </div>
      </>
    );
  }

  /* =========================================
     COMPTEUR
  ========================================= */

  const countLabel =
    locale === "ar"
      ? filteredListings.length ===
        1
        ? "مسكن"
        : "مساكن"
      : locale === "en"
        ? filteredListings.length ===
          1
          ? "property"
          : "properties"
        : locale === "ru"
          ? filteredListings.length ===
            1
            ? "вариант"
            : "вариантов"
          : filteredListings.length ===
              1
            ? "logement"
            : "logements";

  return (
    <>

      <FilterBar
        filters={
          filters
        }
        districts={
          districtOptions
        }
        view={
          view
        }
        onFiltersChange={
          setFilters
        }
        onViewChange={
          setView
        }
      />

      <p className="mt-7 text-sm text-ink-soft">

        {
          filteredListings.length
        }{" "}

        {
          countLabel
        }

      </p>

      {/* AUCUN RÉSULTAT */}

      {filteredListings.length ===
      0 ? (

        <div className="mt-8 rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">

          <p className="text-sm text-ink-soft">

            {locale === "ar"
              ? "لا توجد مساكن مطابقة لهذه الفلاتر."
              : locale === "en"
                ? "No properties match these filters."
                : locale === "ru"
                  ? "Нет жилья, соответствующего этим фильтрам."
                  : "Aucun logement ne correspond à ces filtres."}

          </p>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="mt-5 rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-paper transition hover:bg-green-800"
          >

            {locale === "ar"
              ? "مسح الفلاتر"
              : locale === "en"
                ? "Clear filters"
                : locale === "ru"
                  ? "Сбросить фильтры"
                  : "Réinitialiser"}

          </button>

        </div>

      ) : view ===
        "map" ? (

        <ListingsMap
          listings={
            filteredListings
          }
        />

      ) : (

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {filteredListings.map(
            (
              listing
            ) => (

              <ListingCard
                key={
                  listing.id
                }
                listing={
                  listing
                }
                districtLabel={
                  getDistrictLabel(
                    listing.district
                  )
                }
              />

            )
          )}

        </div>

      )}

    </>
  );
}

/* =========================================
   NORMALISATION NOM INTERNE
========================================= */

function normalizeDistrict(
  value:
    | string
    | null
    | undefined
) {
  return (
    value ??
    ""
  )
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim()
    .toLowerCase()
    .replace(
      /[\s_-]+/g,
      " "
    );
}