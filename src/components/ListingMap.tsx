"use client";

import "leaflet/dist/leaflet.css";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

import type { Listing } from "./ListingCard";

type DistrictPoint = {
  name: string;
  latitude: number;
  longitude: number;
};

type DistrictGroup = {
  key: string;
  name: string;
  latitude: number;
  longitude: number;
  listings: Listing[];
};

const MEDINA: [
  number,
  number,
] = [
  24.4672,
  39.6111,
];

/*
 * UNIQUEMENT DES POINTS DE QUARTIER.
 * JAMAIS L'EMPLACEMENT RÉEL DU LOGEMENT.
 */
const DISTRICTS: Record<
  string,
  DistrictPoint
> = {
  "al khalidiyyah": {
    name:
      "Al Khalidiyyah",
    latitude: 24.481,
    longitude: 39.646,
  },

  khalidiyyah: {
    name:
      "Al Khalidiyyah",
    latitude: 24.481,
    longitude: 39.646,
  },

  الخالدية: {
    name:
      "Al Khalidiyyah",
    latitude: 24.481,
    longitude: 39.646,
  },

  qurban: {
    name: "Qurban",
    latitude: 24.448,
    longitude: 39.612,
  },

  قربان: {
    name: "Qurban",
    latitude: 24.448,
    longitude: 39.612,
  },

  "al awali": {
    name: "Al Awali",
    latitude: 24.437,
    longitude: 39.624,
  },

  العوالي: {
    name: "Al Awali",
    latitude: 24.437,
    longitude: 39.624,
  },

  "bani dhafar": {
    name: "Bani Dhafar",
    latitude: 24.452,
    longitude: 39.629,
  },

  "بني ظفر": {
    name: "Bani Dhafar",
    latitude: 24.452,
    longitude: 39.629,
  },

  "bani harithah": {
    name:
      "Bani Harithah",
    latitude: 24.497,
    longitude: 39.629,
  },

  "بني حارثة": {
    name:
      "Bani Harithah",
    latitude: 24.497,
    longitude: 39.629,
  },

  "al aridh": {
    name: "Al Aridh",
    latitude: 24.493,
    longitude: 39.614,
  },

  العريض: {
    name: "Al Aridh",
    latitude: 24.493,
    longitude: 39.614,
  },

  "al rawabi": {
    name: "Al Rawabi",
    latitude: 24.426,
    longitude: 39.608,
  },

  الروابي: {
    name: "Al Rawabi",
    latitude: 24.426,
    longitude: 39.608,
  },

  "al mustarah": {
    name:
      "Al Mustarah",
    latitude: 24.483,
    longitude: 39.594,
  },

  المستراح: {
    name:
      "Al Mustarah",
    latitude: 24.483,
    longitude: 39.594,
  },
};

function normalize(
  value: string
) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /['’`_-]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function districtPoint(
  district: string
): DistrictPoint {
  const key =
    normalize(
      district
    );

  if (
    DISTRICTS[key]
  ) {
    return DISTRICTS[
      key
    ];
  }

  const partial =
    Object.keys(
      DISTRICTS
    ).find(
      (candidate) =>
        key.includes(
          candidate
        ) ||
        candidate.includes(
          key
        )
    );

  if (partial) {
    return DISTRICTS[
      partial
    ];
  }

  /*
   * Nouveau quartier :
   * position automatique approximative
   * autour de Médine.
   */
  let hash = 0;

  for (
    let i = 0;
    i <
    key.length;
    i++
  ) {
    hash =
      key.charCodeAt(
        i
      ) +
      ((hash << 5) -
        hash);
  }

  return {
    name: district,

    latitude:
      MEDINA[0] +
      ((Math.abs(
        hash
      ) %
        80) -
        40) /
        2500,

    longitude:
      MEDINA[1] +
      ((Math.abs(
        hash >> 8
      ) %
        80) -
        40) /
        2500,
  };
}

export default function ListingsMap({
  listings,
}: {
  listings: Listing[];
}) {
  const locale =
    useLocale();

  const mapElement =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<any>(
      null
    );

  const [
    selected,
    setSelected,
  ] = useState<
    string | null
  >(null);

  const groups =
    useMemo(() => {
      const result =
        new Map<
          string,
          DistrictGroup
        >();

      for (
        const listing of
        listings
      ) {
        const point =
          districtPoint(
            listing.district
          );

        const key =
          normalize(
            point.name
          );

        const group =
          result.get(
            key
          );

        if (group) {
          group.listings.push(
            listing
          );
        } else {
          result.set(
            key,
            {
              key,

              name:
                point.name,

              latitude:
                point.latitude,

              longitude:
                point.longitude,

              listings: [
                listing,
              ],
            }
          );
        }
      }

      return [
        ...result.values(),
      ];
    }, [listings]);

  const selectedGroup =
    groups.find(
      (group) =>
        group.key ===
        selected
    ) ?? null;

  useEffect(() => {
    if (
      groups.length ===
        1 &&
      selected === null
    ) {
      setSelected(
        groups[0].key
      );
    }
  }, [
    groups,
    selected,
  ]);

  useEffect(() => {
    let destroyed =
      false;

    async function start() {
      const element =
        mapElement.current;

      if (!element) {
        return;
      }

      const L =
        await import(
          "leaflet"
        );

      if (destroyed) {
        return;
      }

      if (
        mapRef.current
      ) {
        mapRef.current.remove();
        mapRef.current =
          null;
      }

      const map =
        L.map(
          element,
          {
            zoomControl:
              true,
          }
        );

      mapRef.current =
        map;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 18,

          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
      ).addTo(map);

      const bounds: [
        number,
        number,
      ][] = [];

      for (
        const group of
        groups
      ) {
        const position: [
          number,
          number,
        ] = [
          group.latitude,
          group.longitude,
        ];

        bounds.push(
          position
        );

        /*
         * Cercle vert :
         * aucun PNG, aucune icône Leaflet externe.
         */
        const circle =
          L.circleMarker(
            position,
            {
              radius: 22,

              color:
                "#fffdf8",

              weight: 4,

              fillColor:
                "#0d6c55",

              fillOpacity:
                1,
            }
          );

        circle.addTo(
          map
        );

        /*
         * Nom du quartier visible en permanence.
         */
        circle.bindTooltip(
          `<strong>${group.name}</strong> · ${group.listings.length}`,
          {
            permanent:
              true,

            direction:
              "top",

            offset: [
              0,
              -18,
            ],

            opacity:
              1,
          }
        );

        circle.on(
          "click",
          () => {
            setSelected(
              group.key
            );
          }
        );
      }

      if (
        bounds.length ===
        0
      ) {
        map.setView(
          MEDINA,
          12
        );
      } else if (
        bounds.length ===
        1
      ) {
        map.setView(
          bounds[0],
          13
        );
      } else {
        map.fitBounds(
          bounds,
          {
            padding: [
              70,
              70,
            ],

            maxZoom:
              13,
          }
        );
      }

      setTimeout(
        () =>
          map.invalidateSize(),
        150
      );
    }

    start();

    return () => {
      destroyed =
        true;

      if (
        mapRef.current
      ) {
        mapRef.current.remove();

        mapRef.current =
          null;
      }
    };
  }, [groups]);

  return (
    <div className="mt-8">

      {/* QUARTIERS ACTUELLEMENT DISPONIBLES */}

      <div className="mb-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-ink-soft">
          {locale ===
          "ar"
            ? "الأحياء المتاحة"
            : locale ===
                "en"
              ? "Available districts"
              : locale ===
                  "ru"
                ? "Доступные районы"
                : "Quartiers disponibles"}
        </p>

        <div className="flex flex-wrap gap-2">
          {groups.map(
            (group) => (
              <button
                type="button"
                key={
                  group.key
                }
                onClick={() =>
                  setSelected(
                    group.key
                  )
                }
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  selected ===
                  group.key
                    ? "border-green-700 bg-green-700 text-paper"
                    : "border-ink/10 bg-paper text-ink"
                }`}
              >
                {
                  group.name
                }{" "}
                ·{" "}
                {
                  group
                    .listings
                    .length
                }
              </button>
            )
          )}
        </div>
      </div>

      {/* LOGEMENTS DU QUARTIER */}

      {selectedGroup && (
        <div className="mb-5 rounded-3xl border border-ink/10 bg-paper p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700">
                {
                  selectedGroup.name
                }
              </p>

              <h3 className="mt-1 font-display text-2xl text-ink">
                {
                  selectedGroup
                    .listings
                    .length
                }{" "}
                {locale ===
                "ar"
                  ? "سكن متاح"
                  : locale ===
                      "en"
                    ? "available"
                    : locale ===
                        "ru"
                      ? "доступно"
                      : selectedGroup
                              .listings
                              .length ===
                            1
                        ? "logement disponible"
                        : "logements disponibles"}
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelected(
                  null
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-xl"
            >
              ×
            </button>
          </div>

          <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
            {selectedGroup.listings.map(
              (
                listing
              ) => (
                <Link
                  key={
                    listing.id
                  }
                  href={`/annonces/${listing.id}`}
                  className="w-[260px] shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-sand/40"
                >
                  <div className="aspect-[16/10] bg-sand-deep">
                    {listing.photo ? (
                      <img
                        src={
                          listing.photo
                        }
                        alt={
                          listing.title
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-display text-xl text-ink/20">
                        Mathwa
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="font-medium text-ink">
                      {
                        listing.title
                      }
                    </p>

                    <p className="mt-1 text-sm text-ink-soft">
                      {
                        listing.district
                      }
                    </p>

                    <p className="mt-4 font-display text-xl text-green-700">
                      {"\u20C1"}{" "}
                      {listing.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {/* MAP */}

      <div className="relative z-0 isolate overflow-hidden rounded-3xl border border-ink/10">
        <div
          ref={
            mapElement
          }
          dir="ltr"
          className="relative z-0 h-[600px] w-full"
        />
      </div>

      <p className="mt-3 text-center text-xs text-ink-soft">
        {locale ===
        "ar"
          ? "المواقع تقريبية وتشير إلى الحي فقط، وليس إلى عنوان السكن."
          : locale ===
              "en"
            ? "Locations are approximate and represent the district only, never the exact property address."
            : locale ===
                "ru"
              ? "Точки показывают только примерное расположение района, а не точный адрес жилья."
              : "Les points représentent uniquement une position approximative du quartier, jamais l'adresse exacte du logement."}
      </p>
    </div>
  );
}