"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useLocale } from "next-intl";

import "leaflet/dist/leaflet.css";

import {
  Bath,
  Bed,
  ChevronLeft,
  ChevronRight,
  Layers,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/client";

import type {
  Listing,
} from "./ListingCard";

type District = {
  id: string;

  /*
   * Nom interne.
   *
   * IMPORTANT :
   * on l'utilise pour faire correspondre
   * listing.district avec le quartier.
   *
   * On ne l'affiche plus directement
   * au visiteur.
   */
  name: string;

  name_fr: string | null;
  name_ar: string | null;
  name_en: string | null;
  name_ru: string | null;

  latitude: number;
  longitude: number;
};

type DistrictGroup = {
  district: District;
  label: string;
  listings: Listing[];
};

const MEDINA_CENTER: [
  number,
  number,
] = [
  24.4672,
  39.6024,
];

const words = {
  fr: {
    mapTitle:
      "Logements par quartier",

    available:
      "logements disponibles",

    oneAvailable:
      "logement disponible",

    approximate:
      "Les points indiquent une zone approximative du quartier. L’adresse exacte du logement n’est pas affichée.",

    bedrooms:
      "ch.",

    bathrooms:
      "sdb",

    floor:
      "étage",

    view:
      "Voir l’annonce",

    noDistrict:
      "Aucun logement à afficher sur la carte.",

    loading:
      "Chargement de la carte…",
  },

  en: {
    mapTitle:
      "Homes by district",

    available:
      "homes available",

    oneAvailable:
      "home available",

    approximate:
      "The points show an approximate area of the district. The exact property address is not displayed.",

    bedrooms:
      "beds",

    bathrooms:
      "baths",

    floor:
      "floor",

    view:
      "View listing",

    noDistrict:
      "No homes to display on the map.",

    loading:
      "Loading map…",
  },

  ar: {
    mapTitle:
      "المساكن حسب الحي",

    available:
      "مساكن متاحة",

    oneAvailable:
      "مسكن متاح",

    approximate:
      "تشير النقاط إلى موقع تقريبي للحي فقط، ولا يتم عرض العنوان الدقيق للسكن.",

    bedrooms:
      "غرف",

    bathrooms:
      "حمامات",

    floor:
      "الطابق",

    view:
      "عرض الإعلان",

    noDistrict:
      "لا توجد مساكن لعرضها على الخريطة.",

    loading:
      "جارٍ تحميل الخريطة…",
  },

  ru: {
    mapTitle:
      "Жильё по районам",

    available:
      "доступных вариантов",

    oneAvailable:
      "доступный вариант",

    approximate:
      "Точки показывают примерное расположение района. Точный адрес жилья не отображается.",

    bedrooms:
      "спальни",

    bathrooms:
      "ванные",

    floor:
      "этаж",

    view:
      "Открыть объявление",

    noDistrict:
      "Нет жилья для отображения на карте.",

    loading:
      "Загрузка карты…",
  },
};

export default function ListingsMap({
  listings,
}: {
  listings: Listing[];
}) {
  const locale =
    useLocale();

  const rtl =
    locale === "ar";

  const text =
    words[
      locale as keyof typeof words
    ] ??
    words.fr;

  const mapContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<any>(
      null
    );

  const leafletRef =
    useRef<any>(
      null
    );

  const markersLayerRef =
    useRef<any>(
      null
    );

  const carouselRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    districts,
    setDistricts,
  ] =
    useState<District[]>(
      []
    );

  const [
    districtsLoading,
    setDistrictsLoading,
  ] =
    useState(
      true
    );

  const [
    mapReady,
    setMapReady,
  ] =
    useState(
      false
    );

  const [
    selectedDistrictId,
    setSelectedDistrictId,
  ] =
    useState<
      string | null
    >(
      null
    );

  /* =========================================
     NOM TRADUIT DU QUARTIER
  ========================================= */

  function getDistrictLabel(
    district: District
  ) {
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
     CHARGEMENT DES QUARTIERS
  ========================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function loadDistricts() {
      setDistrictsLoading(
        true
      );

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
            latitude,
            longitude
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

        setDistrictsLoading(
          false
        );

        return;
      }

      const cleanDistricts =
        (
          data ??
          []
        )
          .map(
            (
              district
            ) => ({
              id:
                district.id,

              name:
                district.name,

              name_fr:
                district.name_fr,

              name_ar:
                district.name_ar,

              name_en:
                district.name_en,

              name_ru:
                district.name_ru,

              latitude:
                Number(
                  district.latitude
                ),

              longitude:
                Number(
                  district.longitude
                ),
            })
          )
          .filter(
            (
              district
            ) =>
              Number.isFinite(
                district.latitude
              ) &&
              Number.isFinite(
                district.longitude
              )
          );

      setDistricts(
        cleanDistricts
      );

      setDistrictsLoading(
        false
      );
    }

    loadDistricts();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* =========================================
     GROUPES DE QUARTIERS
  ========================================= */

  const groups =
    useMemo<
      DistrictGroup[]
    >(
      () => {
        return districts
          .map(
            (
              district
            ) => {
              /*
               * IMPORTANT :
               *
               * matching sur district.name,
               * pas sur les traductions.
               */
              const districtListings =
                listings.filter(
                  (
                    listing
                  ) =>
                    normalizeDistrict(
                      listing.district
                    ) ===
                    normalizeDistrict(
                      district.name
                    )
                );

              return {
                district,

                label:
                  getDistrictLabel(
                    district
                  ),

                listings:
                  districtListings,
              };
            }
          )
          /*
           * Aucun marqueur pour
           * un quartier sans annonce.
           */
          .filter(
            (
              group
            ) =>
              group.listings
                .length >
              0
          );
      },
      [
        districts,
        listings,
        locale,
      ]
    );

  const selectedGroup =
    useMemo(
      () =>
        groups.find(
          (
            group
          ) =>
            group
              .district
              .id ===
            selectedDistrictId
        ) ??
        null,

      [
        groups,
        selectedDistrictId,
      ]
    );

  const totalListings =
    useMemo(
      () =>
        groups.reduce(
          (
            total,
            group
          ) =>
            total +
            group.listings
              .length,
          0
        ),

      [
        groups,
      ]
    );

  /* =========================================
     INITIALISATION LEAFLET
  ========================================= */

  useEffect(() => {
    if (
      districtsLoading ||
      !mapContainerRef.current ||
      mapRef.current
    ) {
      return;
    }

    let cancelled =
      false;

    async function initMap() {
      const L =
        await import(
          "leaflet"
        );

      if (
        cancelled ||
        !mapContainerRef.current ||
        mapRef.current
      ) {
        return;
      }

      leafletRef.current =
        L;

      const map =
        L.map(
          mapContainerRef.current,
          {
            zoomControl:
              true,

            attributionControl:
              true,
          }
        );

      map.setView(
        MEDINA_CENTER,
        12
      );

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom:
            19,

          attribution:
            "&copy; OpenStreetMap",
        }
      ).addTo(
        map
      );

      const markerLayer =
        L.layerGroup().addTo(
          map
        );

      mapRef.current =
        map;

      markersLayerRef.current =
        markerLayer;

      setMapReady(
        true
      );

      /*
       * Leaflet peut calculer
       * une mauvaise taille
       * immédiatement après le rendu React.
       */
      window.setTimeout(
        () => {
          map.invalidateSize();
        },
        100
      );

      window.setTimeout(
        () => {
          map.invalidateSize();
        },
        400
      );
    }

    initMap();

    return () => {
      cancelled =
        true;
    };
  }, [
    districtsLoading,
  ]);

  /* =========================================
     MARKERS
  ========================================= */

  useEffect(() => {
    const map =
      mapRef.current;

    const L =
      leafletRef.current;

    const layer =
      markersLayerRef.current;

    if (
      !mapReady ||
      !map ||
      !L ||
      !layer
    ) {
      return;
    }

    layer.clearLayers();

    groups.forEach(
      (
        group
      ) => {
        const selected =
          selectedDistrictId ===
          group.district.id;

        const label =
          escapeHtml(
            group.label
          );

        const count =
          group.listings.length;

        const background =
          selected
            ? "#06392e"
            : "#fffdf8";

        const textColor =
          selected
            ? "#fffdf8"
            : "#12211c";

        const countBackground =
          selected
            ? "rgba(255,255,255,0.16)"
            : "#d9ebe4";

        const countColor =
          selected
            ? "#ffffff"
            : "#0a5443";

        const icon =
          L.divIcon({
            className:
              "mathwa-map-marker",

            html: `
              <div
                style="
                  display:flex;
                  align-items:center;
                  gap:7px;
                  min-width:max-content;
                  padding:7px 9px 7px 11px;
                  border-radius:999px;
                  background:${background};
                  color:${textColor};
                  border:1px solid rgba(18,33,28,0.12);
                  box-shadow:0 7px 22px rgba(18,33,28,0.14);
                  font-family:inherit;
                  font-size:12px;
                  font-weight:500;
                  white-space:nowrap;
                  transition:all .18s ease;
                "
              >
                <span>
                  ${label}
                </span>

                <span
                  style="
                    display:flex;
                    width:25px;
                    height:25px;
                    align-items:center;
                    justify-content:center;
                    border-radius:999px;
                    background:${countBackground};
                    color:${countColor};
                    font-size:11px;
                    font-weight:700;
                  "
                >
                  ${count}
                </span>
              </div>
            `,

            iconSize:
              undefined,

            iconAnchor: [
              0,
              0,
            ],
          });

        const marker =
          L.marker(
            [
              group.district
                .latitude,

              group.district
                .longitude,
            ],
            {
              icon,
            }
          );

        marker.on(
          "click",
          () => {
            setSelectedDistrictId(
              group.district.id
            );

            map.flyTo(
              [
                group.district
                  .latitude,

                group.district
                  .longitude,
              ],
              Math.max(
                map.getZoom(),
                13
              ),
              {
                duration:
                  0.55,
              }
            );
          }
        );

        marker.addTo(
          layer
        );
      }
    );
  }, [
    groups,
    mapReady,
    selectedDistrictId,
  ]);

  /* =========================================
     AJUSTER LA CARTE AUX QUARTIERS
  ========================================= */

  useEffect(() => {
    const map =
      mapRef.current;

    const L =
      leafletRef.current;

    if (
      !mapReady ||
      !map ||
      !L ||
      groups.length ===
        0
    ) {
      return;
    }

    /*
     * On ne recentre pas quand
     * un quartier est déjà ouvert.
     */
    if (
      selectedDistrictId
    ) {
      return;
    }

    if (
      groups.length ===
      1
    ) {
      map.setView(
        [
          groups[0]
            .district
            .latitude,

          groups[0]
            .district
            .longitude,
        ],
        13
      );

      return;
    }

    const bounds =
      L.latLngBounds(
        groups.map(
          (
            group
          ) => [
            group.district
              .latitude,

            group.district
              .longitude,
          ]
        )
      );

    map.fitBounds(
      bounds,
      {
        paddingTopLeft: [
          60,
          90,
        ],

        paddingBottomRight: [
          60,
          190,
        ],

        maxZoom:
          13,
      }
    );
  }, [
    groups,
    mapReady,
    selectedDistrictId,
  ]);

  /* =========================================
     CLEANUP
  ========================================= */

  useEffect(() => {
    return () => {
      if (
        mapRef.current
      ) {
        mapRef.current.remove();

        mapRef.current =
          null;

        markersLayerRef.current =
          null;

        leafletRef.current =
          null;
      }
    };
  }, []);

  /* =========================================
     CAROUSEL
  ========================================= */

  function scrollCarousel(
    direction:
      | "left"
      | "right"
  ) {
    const container =
      carouselRef.current;

    if (
      !container
    ) {
      return;
    }

    const amount =
      Math.min(
        380,
        container.clientWidth *
          0.78
      );

    container.scrollBy({
      left:
        direction ===
        "right"
          ? amount
          : -amount,

      behavior:
        "smooth",
    });
  }

  /* =========================================
     RENDER
  ========================================= */

  if (
    districtsLoading
  ) {
    return (
      <div className="mt-8 flex min-h-[590px] items-center justify-center overflow-hidden rounded-[30px] border border-ink/10 bg-sand-deep text-sm text-ink-soft">
        {text.loading}
      </div>
    );
  }

  if (
    groups.length ===
    0
  ) {
    return (
      <div className="mt-8 flex min-h-[420px] flex-col items-center justify-center rounded-[30px] border border-dashed border-ink/15 bg-sand/50 px-6 text-center">

        <MapPin className="h-6 w-6 text-green-700/50" />

        <p className="mt-4 text-sm text-ink-soft">
          {
            text.noDistrict
          }
        </p>

      </div>
    );
  }

  return (
    <div
      dir={
        rtl
          ? "rtl"
          : "ltr"
      }
      className="relative mt-8 h-[68vh] min-h-[590px] overflow-hidden rounded-[30px] border border-ink/10 bg-sand-deep shadow-[0_15px_55px_rgba(18,33,28,0.08)]"
    >

      {/* =====================================
          CARTE
      ===================================== */}

      <div
        ref={
          mapContainerRef
        }
        className="absolute inset-0 z-0 h-full w-full"
      />

      {/* =====================================
          BARRE FLOTTANTE EN HAUT
      ===================================== */}

      <div className="pointer-events-none absolute inset-x-0 top-4 z-[500] flex justify-center px-4">

        <div className="pointer-events-auto flex max-w-[calc(100%-20px)] items-center gap-3 rounded-full border border-white/70 bg-paper/95 px-4 py-2.5 shadow-[0_8px_30px_rgba(18,33,28,0.14)] backdrop-blur-md">

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800">

            <MapPin className="h-4 w-4" />

          </span>

          <div className="min-w-0">

            <p className="truncate text-xs font-medium text-ink">

              {selectedGroup
                ? selectedGroup.label
                : text.mapTitle}

            </p>

            <p className="mt-0.5 truncate text-[10px] text-ink-soft">

              {selectedGroup
                ? `${selectedGroup.listings.length} ${
                    selectedGroup
                      .listings
                      .length ===
                    1
                      ? text.oneAvailable
                      : text.available
                  }`
                : `${totalListings} ${
                    totalListings ===
                    1
                      ? text.oneAvailable
                      : text.available
                  }`}

            </p>

          </div>

        </div>

      </div>

      {/* =====================================
          FICHE / CAROUSEL DU QUARTIER
      ===================================== */}

      {selectedGroup && (
        <div className="absolute inset-x-0 bottom-0 z-[600] px-3 pb-3 sm:px-5 sm:pb-5">

          <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-paper/95 shadow-[0_18px_60px_rgba(18,33,28,0.22)] backdrop-blur-xl">

            {/* CLOSE */}

            <button
              type="button"
              aria-label="Fermer"
              onClick={() =>
                setSelectedDistrictId(
                  null
                )
              }
              className="absolute end-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-paper shadow-lg transition hover:scale-105"
            >
              <X className="h-4 w-4" />
            </button>

            {/* HEADER */}

            <div className="flex items-end justify-between gap-5 px-5 pb-3 pt-5 pe-16 sm:px-6 sm:pe-16">

              <div>

                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-green-700">

                  <MapPin className="h-3.5 w-3.5" />

                  {
                    selectedGroup.label
                  }

                </p>

                <p className="mt-1.5 text-sm text-ink-soft">

                  {
                    selectedGroup
                      .listings
                      .length
                  }{" "}

                  {selectedGroup
                    .listings
                    .length ===
                  1
                    ? text.oneAvailable
                    : text.available}

                </p>

              </div>

              {selectedGroup
                .listings
                .length >
                1 && (

                <div className="hidden gap-2 pe-1 sm:flex">

                  <button
                    type="button"
                    onClick={() =>
                      scrollCarousel(
                        rtl
                          ? "right"
                          : "left"
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-paper text-ink transition hover:bg-green-100 hover:text-green-800"
                  >
                    {rtl ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronLeft className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollCarousel(
                        rtl
                          ? "left"
                          : "right"
                      )
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-paper text-ink transition hover:bg-green-100 hover:text-green-800"
                  >
                    {rtl ? (
                      <ChevronLeft className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                </div>

              )}

            </div>

            {/* CAROUSEL */}

            <div
              ref={
                carouselRef
              }
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 sm:px-6 [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth:
                  "none",
              }}
            >

              {selectedGroup.listings.map(
                (
                  listing
                ) => (
                  <MapListingCard
                    key={
                      listing.id
                    }
                    listing={
                      listing
                    }
                    locale={
                      locale
                    }
                    districtLabel={
                      selectedGroup.label
                    }
                    text={
                      text
                    }
                  />
                )
              )}

            </div>

            {/* APPROXIMATE LOCATION */}

            <div className="border-t border-ink/8 px-5 py-3 sm:px-6">

              <p className="flex items-start gap-2 text-[10px] leading-4 text-ink-soft">

                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-green-700" />

                <span>
                  {
                    text.approximate
                  }
                </span>

              </p>

            </div>

          </div>

        </div>
      )}

      {/* =====================================
          STYLE DES DIVICON LEAFLET
      ===================================== */}

      <style jsx global>{`
        .mathwa-map-marker {
          background: transparent !important;
          border: 0 !important;
          width: auto !important;
          height: auto !important;
        }

        .mathwa-map-marker > div {
          transform: translate(-50%, -50%);
          cursor: pointer;
        }

        .mathwa-map-marker > div:hover {
          transform: translate(-50%, -50%) translateY(-2px);
          box-shadow: 0 10px 28px rgba(18, 33, 28, 0.2) !important;
        }

        .leaflet-container {
          font-family: inherit;
        }

        .leaflet-control-zoom {
          border: 0 !important;
          box-shadow: 0 8px 25px rgba(18, 33, 28, 0.14) !important;
        }

        .leaflet-control-zoom a {
          border: 0 !important;
          color: #12211c !important;
          background: #fffdf8 !important;
        }

        .leaflet-control-zoom a:first-child {
          border-radius: 12px 12px 0 0 !important;
        }

        .leaflet-control-zoom a:last-child {
          border-radius: 0 0 12px 12px !important;
        }

        .leaflet-control-attribution {
          font-size: 8px !important;
          background: rgba(255, 253, 248, 0.82) !important;
          backdrop-filter: blur(8px);
        }
      `}</style>

    </div>
  );
}

/* =========================================
   CARTE D'UNE ANNONCE DANS LE CAROUSEL
========================================= */

function MapListingCard({
  listing,
  locale,
  districtLabel,
  text,
}: {
  listing: Listing;
  locale: string;
  districtLabel: string;

  text:
    (typeof words)[
      keyof typeof words
    ];
}) {
  const localeFormat =
    locale === "ar"
      ? "ar-SA"
      : locale === "ru"
        ? "ru-RU"
        : locale === "en"
          ? "en-US"
          : "fr-FR";

  return (
    <a
      href={`/${locale}/annonces/${listing.id}`}
      className="group flex w-[285px] shrink-0 snap-start overflow-hidden rounded-[20px] border border-ink/10 bg-paper transition duration-200 hover:-translate-y-0.5 hover:border-green-700/25 hover:shadow-[0_10px_30px_rgba(18,33,28,0.09)] sm:w-[320px]"
    >

      {/* PHOTO */}

      <div className="relative w-[108px] shrink-0 overflow-hidden bg-sand-deep sm:w-[125px]">

        {listing.photo ? (
          <img
            src={
              listing.photo
            }
            alt={
              listing.title
            }
            className="h-full min-h-[145px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full min-h-[145px] items-center justify-center">

            <div className="flex h-14 w-9 items-center justify-center rounded-t-full border border-green-700/15 bg-green-100">

              <MapPin className="h-4 w-4 text-green-700/50" />

            </div>

          </div>
        )}

        {listing.verified && (
          <span className="absolute start-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-paper/95 text-green-700 shadow-sm backdrop-blur">

            <ShieldCheck className="h-3.5 w-3.5" />

          </span>
        )}

      </div>

      {/* CONTENT */}

      <div className="flex min-w-0 flex-1 flex-col p-4">

        <p className="line-clamp-2 text-sm font-medium leading-5 text-ink">
          {
            listing.title
          }
        </p>

        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-ink-soft">

          <MapPin className="h-3 w-3 shrink-0 text-green-700" />

          <span className="truncate">
            {
              districtLabel
            }
          </span>

        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-ink-soft">

          <span className="flex items-center gap-1">

            <Bed className="h-3 w-3" />

            {
              listing.rooms
            }{" "}
            {
              text.bedrooms
            }

          </span>

          <span className="flex items-center gap-1">

            <Bath className="h-3 w-3" />

            {
              listing.bathrooms
            }{" "}
            {
              text.bathrooms
            }

          </span>

          {listing.floor && (
            <span className="flex items-center gap-1">

              <Layers className="h-3 w-3" />

              {
                listing.floor
              }

            </span>
          )}

        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">

          <div>

            <p className="font-display text-[21px] font-medium leading-none text-green-700">

              <span aria-hidden="true">
                {"\u20C1"}
              </span>{" "}

              {Number(
                listing.price
              ).toLocaleString(
                localeFormat
              )}

            </p>

          </div>

          <span className="shrink-0 text-[10px] font-medium text-green-700">
            {
              text.view
            }
          </span>

        </div>

      </div>

    </a>
  );
}

/* =========================================
   NORMALISATION DU NOM INTERNE
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

/* =========================================
   PROTECTION HTML DIVICON
========================================= */

function escapeHtml(
  value: string
) {
  return value
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}