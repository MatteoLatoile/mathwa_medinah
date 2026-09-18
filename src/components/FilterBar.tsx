"use client";

import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  Banknote,
  Bath,
  BedDouble,
  CalendarDays,
  ChevronDown,
  List,
  Map,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

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
          title:
            "تصفية النتائج",
          subtitle:
            "اختر ما يناسب بحثك",
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
            "مسح الفلاتر",
          active:
            "نشط",
        }
      : locale === "en"
        ? {
            title:
              "Filter properties",
            subtitle:
              "Refine your search",
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
            active:
              "active",
          }
        : locale === "ru"
          ? {
              title:
                "Фильтры",
              subtitle:
                "Уточните параметры поиска",
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
              active:
                "активно",
            }
          : {
              title:
                "Filtrer les logements",
              subtitle:
                "Affinez votre recherche",
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
              active:
                "actif",
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

  const activeFilterCount =
    [
      filters.district,
      filters.priceMin,
      filters.priceMax,
      filters.period !== "all"
        ? filters.period
        : "",
      filters.rooms,
      filters.bathrooms,
    ].filter(Boolean).length;

  const hasFilters =
    activeFilterCount > 0;

  const fieldClass =
    "h-12 w-full rounded-2xl border border-ink/10 bg-paper text-sm text-ink shadow-[0_4px_18px_rgba(18,33,28,0.035)] outline-none transition-all duration-200 hover:border-green-700/25 focus:border-green-700 focus:ring-4 focus:ring-green-700/[0.07]";

  const iconClass =
    "pointer-events-none absolute start-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-green-700 transition-colors";

  const chevronClass =
    "pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/55";

  return (
    <div className="relative overflow-visible rounded-[28px] border border-ink/[0.08] bg-paper/80 p-4 shadow-[0_18px_60px_rgba(18,33,28,0.06)] backdrop-blur-sm sm:p-5">

      {/* HEADER */}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-800">
            <SlidersHorizontal className="h-[18px] w-[18px]" />
          </div>

          <div>
            <div className="flex items-center gap-2">

              <p className="text-sm font-semibold text-ink">
                {labels.title}
              </p>

              {hasFilters && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green-700 px-1.5 text-[10px] font-semibold text-paper">
                  {activeFilterCount}
                </span>
              )}

            </div>

            <p className="mt-0.5 text-xs text-ink-soft/70">
              {labels.subtitle}
            </p>
          </div>

        </div>

        {/* LISTE / CARTE */}

        <div className="inline-flex w-fit items-center rounded-full border border-ink/[0.07] bg-sand p-1">

          <button
            type="button"
            onClick={() =>
              onViewChange(
                "list"
              )
            }
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 sm:text-sm ${
              view === "list"
                ? "bg-green-700 text-paper shadow-[0_5px_16px_rgba(13,108,85,0.22)]"
                : "text-ink-soft hover:bg-paper hover:text-ink"
            }`}
          >
            <List className="h-4 w-4" />

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
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 sm:text-sm ${
              view === "map"
                ? "bg-green-700 text-paper shadow-[0_5px_16px_rgba(13,108,85,0.22)]"
                : "text-ink-soft hover:bg-paper hover:text-ink"
            }`}
          >
            <Map className="h-4 w-4" />

            {t(
              "viewMap"
            )}
          </button>

        </div>

      </div>

      {/* FILTRES */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">

        {/* QUARTIER */}

        <div className="relative sm:col-span-2 lg:col-span-3">

          <MapPin
            className={
              iconClass
            }
          />

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
            className={`${fieldClass} appearance-none ps-11 pe-10`}
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

          <ChevronDown
            className={
              chevronClass
            }
          />

        </div>

        {/* PRIX MIN */}

        <div className="relative lg:col-span-2">

          <Banknote
            className={
              iconClass
            }
          />

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
            className={`${fieldClass} ps-11 pe-10 placeholder:text-ink-soft/55`}
            aria-label={t(
              "priceMin"
            )}
          />

          <span className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-soft/50">
            ﷼
          </span>

        </div>

        {/* PRIX MAX */}

        <div className="relative lg:col-span-2">

          <Banknote
            className={
              iconClass
            }
          />

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
            className={`${fieldClass} ps-11 pe-10 placeholder:text-ink-soft/55`}
            aria-label={t(
              "priceMax"
            )}
          />

          <span className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-soft/50">
            ﷼
          </span>

        </div>

        {/* PÉRIODE */}

        <div className="relative lg:col-span-2">

          <CalendarDays
            className={
              iconClass
            }
          />

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
            className={`${fieldClass} appearance-none ps-11 pe-10`}
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

          <ChevronDown
            className={
              chevronClass
            }
          />

        </div>

        {/* CHAMBRES */}

        <div className="relative lg:col-span-3">

          <BedDouble
            className={
              iconClass
            }
          />

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
            className={`${fieldClass} appearance-none ps-11 pe-10`}
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

          <ChevronDown
            className={
              chevronClass
            }
          />

        </div>

        {/* SALLES DE BAIN */}

        <div className="relative sm:col-span-1 lg:col-span-3">

          <Bath
            className={
              iconClass
            }
          />

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
            className={`${fieldClass} appearance-none ps-11 pe-10`}
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

          <ChevronDown
            className={
              chevronClass
            }
          />

        </div>

        {/* RESET */}

        <div className="flex items-center sm:col-span-1 lg:col-span-3">

          {hasFilters ? (
            <button
              type="button"
              onClick={
                reset
              }
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-900/[0.08] bg-red-50/70 px-4 text-sm font-medium text-red-800 transition-all duration-200 hover:border-red-900/15 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-45" />

              {
                labels.reset
              }
            </button>
          ) : (
            <div className="hidden h-12 lg:block" />
          )}

        </div>

      </div>

    </div>
  );
}