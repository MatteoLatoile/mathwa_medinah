"use client";

import {
  useLocale,
  useTranslations,
} from "next-intl";

export type FilterValues = {
  district: string;
  priceMin: string;
  priceMax: string;
  period: "all" | "month" | "year";
  rooms: string;
  bathrooms: string;
};

export type DistrictOption = {
  value: string;
  label: string;
};

type Props = {
  filters: FilterValues;
  districts: DistrictOption[];
  view: "list" | "map";
  onFiltersChange: (
    filters: FilterValues
  ) => void;
  onViewChange: (
    view: "list" | "map"
  ) => void;
};

export default function FilterBar({
  filters,
  districts,
  view,
  onFiltersChange,
  onViewChange,
}: Props) {
  const t =
    useTranslations(
      "filters"
    );

  const locale =
    useLocale();

  const labels =
    locale === "ar"
      ? {
          allPeriods:
            "شهري أو سنوي",
          monthly:
            "شهري",
          yearly:
            "سنوي",
          allRooms:
            "كل الغرف",
          bedroom:
            "غرفة",
          bedrooms:
            "غرف",
          allBathrooms:
            "كل دورات المياه",
          bathroom:
            "دورة مياه",
          bathrooms:
            "دورات مياه",
          reset:
            "مسح عوامل التصفية",
        }
      : locale === "en"
        ? {
            allPeriods:
              "Monthly or yearly",
            monthly:
              "Monthly",
            yearly:
              "Yearly",
            allRooms:
              "All bedrooms",
            bedroom:
              "bedroom",
            bedrooms:
              "bedrooms",
            allBathrooms:
              "All bathrooms",
            bathroom:
              "bathroom",
            bathrooms:
              "bathrooms",
            reset:
              "Clear filters",
          }
        : locale === "ru"
          ? {
              allPeriods:
                "Помесячно или на год",
              monthly:
                "Помесячно",
              yearly:
                "На год",
              allRooms:
                "Все спальни",
              bedroom:
                "спальня",
              bedrooms:
                "спальни",
              allBathrooms:
                "Все санузлы",
              bathroom:
                "санузел",
              bathrooms:
                "санузлы",
              reset:
                "Сбросить фильтры",
            }
          : {
              allPeriods:
                "Mensuel ou annuel",
              monthly:
                "Mensuel",
              yearly:
                "Annuel",
              allRooms:
                "Toutes les chambres",
              bedroom:
                "chambre",
              bedrooms:
                "chambres",
              allBathrooms:
                "Toutes les salles de bain",
              bathroom:
                "salle de bain",
              bathrooms:
                "salles de bain",
              reset:
                "Effacer les filtres",
            };

  function update<
    K extends keyof FilterValues,
  >(
    key: K,
    value: FilterValues[K]
  ) {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }

  function reset() {
    onFiltersChange({
      district: "",
      priceMin: "",
      priceMax: "",
      period: "all",
      rooms: "",
      bathrooms: "",
    });
  }

  const hasFilters =
    filters.district !== "" ||
    filters.priceMin !== "" ||
    filters.priceMax !== "" ||
    filters.period !== "all" ||
    filters.rooms !== "" ||
    filters.bathrooms !== "";

  const selectClass =
    "h-12 w-full rounded-xl border border-ink/15 bg-paper px-4 text-sm text-ink outline-none transition focus:border-green-700";

  const inputClass =
    "h-12 w-full rounded-xl border border-ink/15 bg-paper px-4 text-sm text-ink outline-none transition placeholder:text-ink-soft/70 focus:border-green-700";

  return (
    <div className="rounded-2xl border border-ink/10 bg-paper/35 p-4 sm:p-5">

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

        {/* QUARTIER */}

        <select
          value={
            filters.district
          }
          onChange={(
            event
          ) =>
            update(
              "district",
              event.target.value
            )
          }
          className={
            selectClass
          }
          aria-label={t(
            "district"
          )}
        >
          <option value="">
            {t(
              "allDistricts"
            )}
          </option>

          {districts.map(
            (
              district
            ) => (
              <option
                key={
                  district.value
                }
                value={
                  district.value
                }
              >
                {
                  district.label
                }
              </option>
            )
          )}

        </select>

        {/* PRIX MINIMUM */}

        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={
            filters.priceMin
          }
          onChange={(
            event
          ) =>
            update(
              "priceMin",
              event.target.value
            )
          }
          placeholder={t(
            "priceMin"
          )}
          className={
            inputClass
          }
          aria-label={t(
            "priceMin"
          )}
        />

        {/* PRIX MAXIMUM */}

        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={
            filters.priceMax
          }
          onChange={(
            event
          ) =>
            update(
              "priceMax",
              event.target.value
            )
          }
          placeholder={t(
            "priceMax"
          )}
          className={
            inputClass
          }
          aria-label={t(
            "priceMax"
          )}
        />

        {/* PÉRIODE */}

        <select
          value={
            filters.period
          }
          onChange={(
            event
          ) =>
            update(
              "period",
              event.target
                .value as FilterValues["period"]
            )
          }
          className={
            selectClass
          }
          aria-label={t(
            "period"
          )}
        >
          <option value="all">
            {
              labels.allPeriods
            }
          </option>

          <option value="month">
            {
              labels.monthly
            }
          </option>

          <option value="year">
            {
              labels.yearly
            }
          </option>
        </select>

        {/* CHAMBRES */}

        <select
          value={
            filters.rooms
          }
          onChange={(
            event
          ) =>
            update(
              "rooms",
              event.target.value
            )
          }
          className={
            selectClass
          }
          aria-label={t(
            "rooms"
          )}
        >
          <option value="">
            {
              labels.allRooms
            }
          </option>

          {[1, 2, 3, 4, 5].map(
            (
              number
            ) => (
              <option
                key={
                  number
                }
                value={String(
                  number
                )}
              >
                {number}{" "}
                {number === 1
                  ? labels.bedroom
                  : labels.bedrooms}
              </option>
            )
          )}

          <option value="6+">
            6+
          </option>

        </select>

      </div>

      {/* DEUXIÈME LIGNE */}

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          {/* SALLES DE BAIN */}

          <select
            value={
              filters.bathrooms
            }
            onChange={(
              event
            ) =>
              update(
                "bathrooms",
                event.target.value
              )
            }
            className={`${selectClass} sm:w-[220px]`}
            aria-label={t(
              "bathrooms"
            )}
          >
            <option value="">
              {
                labels.allBathrooms
              }
            </option>

            {[1, 2, 3, 4].map(
              (
                number
              ) => (
                <option
                  key={
                    number
                  }
                  value={String(
                    number
                  )}
                >
                  {number}{" "}
                  {number === 1
                    ? labels.bathroom
                    : labels.bathrooms}
                </option>
              )
            )}

            <option value="5+">
              5+
            </option>

          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={
                reset
              }
              className="text-sm text-ink-soft underline underline-offset-4 transition hover:text-green-700"
            >
              {
                labels.reset
              }
            </button>
          )}

        </div>

        {/* LISTE / CARTE */}

        <div className="inline-flex w-fit rounded-full bg-sand-deep p-1">

          <button
            type="button"
            onClick={() =>
              onViewChange(
                "list"
              )
            }
            className={`rounded-full px-5 py-2 text-sm transition ${
              view === "list"
                ? "bg-green-700 text-paper"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {t(
              "viewList"
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              onViewChange(
                "map"
              )
            }
            className={`rounded-full px-5 py-2 text-sm transition ${
              view === "map"
                ? "bg-green-700 text-paper"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {t(
              "viewMap"
            )}
          </button>

        </div>

      </div>

    </div>
  );
}
