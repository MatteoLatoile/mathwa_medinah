"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  PointerEvent as ReactPointerEvent,
} from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { createClient } from "@/lib/supabase/client";

type District = {
  id: string;
  name: string;

  name_fr: string | null;
  name_ar: string | null;
  name_en: string | null;
  name_ru: string | null;

  latitude: number;
  longitude: number;

  active: boolean;
  sort_order: number;
};

type FormState = {
  id: string | null;

  internalName: string;

  name_fr: string;
  name_ar: string;
  name_en: string;
  name_ru: string;

  latitude: string;
  longitude: string;

  active: boolean;
  sort_order: string;
};

const EMPTY_FORM: FormState = {
  id: null,

  internalName: "",

  name_fr: "",
  name_ar: "",
  name_en: "",
  name_ru: "",

  latitude: "24.468600",
  longitude: "39.614200",

  active: true,
  sort_order: "100",
};

export default function DistrictManager({
  initialDistricts,
}: {
  initialDistricts: District[];
}) {
  const [
    districts,
    setDistricts,
  ] = useState(
    initialDistricts
  );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      EMPTY_FORM
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const mapContainerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const mapRef =
    useRef<L.Map | null>(
      null
    );

  const markerRef =
    useRef<L.CircleMarker | null>(
      null
    );

  /* ========================================
     MAP INIT
  ======================================== */

  useEffect(() => {
    if (
      !mapContainerRef.current ||
      mapRef.current
    ) {
      return;
    }

    const map = L.map(
      mapContainerRef.current,
      {
        zoomControl:
          true,
      }
    ).setView(
      [
        24.4686,
        39.6142,
      ],
      12
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "&copy; OpenStreetMap",
      }
    ).addTo(map);

    map.on(
      "click",
      (
        event:
          L.LeafletMouseEvent
      ) => {
        updateCoordinates(
          event.latlng.lat,
          event.latlng.lng
        );
      }
    );

    mapRef.current =
      map;

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();

      mapRef.current =
        null;

      markerRef.current =
        null;
    };
  }, []);

  /* ========================================
     POSITION MARKER
  ======================================== */

  useEffect(() => {
    const map =
      mapRef.current;

    if (!map) {
      return;
    }

    const latitude =
      Number(
        form.latitude
      );

    const longitude =
      Number(
        form.longitude
      );

    if (
      !Number.isFinite(
        latitude
      ) ||
      !Number.isFinite(
        longitude
      )
    ) {
      return;
    }

    if (
      markerRef.current
    ) {
      markerRef.current.setLatLng(
        [
          latitude,
          longitude,
        ]
      );
    } else {
      markerRef.current =
        L.circleMarker(
          [
            latitude,
            longitude,
          ],
          {
            radius: 9,
            weight: 3,
            color: "#ffffff",
            fillColor:
              "#0d6c55",
            fillOpacity: 1,
          }
        ).addTo(map);
    }
  }, [
    form.latitude,
    form.longitude,
  ]);

  function updateCoordinates(
    latitude: number,
    longitude: number
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,

        latitude:
          latitude.toFixed(
            6
          ),

        longitude:
          longitude.toFixed(
            6
          ),
      })
    );
  }

  /* ========================================
     NOUVEAU QUARTIER
  ======================================== */

  function newDistrict() {
    setForm({
      ...EMPTY_FORM,
    });

    setError("");
    setSuccess("");

    mapRef.current?.flyTo(
      [
        24.4686,
        39.6142,
      ],
      12,
      {
        duration:
          0.5,
      }
    );
  }

  /* ========================================
     SÉLECTION
  ======================================== */

  function selectDistrict(
    district: District
  ) {
    setForm({
      id:
        district.id,

      internalName:
        district.name,

      name_fr:
        district.name_fr ??
        district.name,

      name_ar:
        district.name_ar ??
        "",

      name_en:
        district.name_en ??
        district.name,

      name_ru:
        district.name_ru ??
        "",

      latitude:
        Number(
          district.latitude
        ).toFixed(
          6
        ),

      longitude:
        Number(
          district.longitude
        ).toFixed(
          6
        ),

      active:
        district.active,

      sort_order:
        String(
          district.sort_order ??
            100
        ),
    });

    setError("");
    setSuccess("");

    mapRef.current?.flyTo(
      [
        Number(
          district.latitude
        ),
        Number(
          district.longitude
        ),
      ],
      14,
      {
        duration:
          0.6,
      }
    );
  }

  /* ========================================
     SAVE
  ======================================== */

  async function saveDistrict() {
    setError("");
    setSuccess("");

    const nameFr =
      form.name_fr.trim();

    const nameAr =
      form.name_ar.trim();

    const nameEn =
      form.name_en.trim();

    const nameRu =
      form.name_ru.trim();

    if (
      !nameFr &&
      !nameAr &&
      !nameEn &&
      !nameRu
    ) {
      setError(
        "Ajoute au moins un nom pour le quartier."
      );

      return;
    }

    const latitude =
      Number(
        form.latitude
      );

    const longitude =
      Number(
        form.longitude
      );

    if (
      !Number.isFinite(
        latitude
      ) ||
      !Number.isFinite(
        longitude
      )
    ) {
      setError(
        "Latitude ou longitude incorrecte."
      );

      return;
    }

    if (
      latitude < -90 ||
      latitude > 90
    ) {
      setError(
        "La latitude doit être comprise entre -90 et 90."
      );

      return;
    }

    if (
      longitude < -180 ||
      longitude > 180
    ) {
      setError(
        "La longitude doit être comprise entre -180 et 180."
      );

      return;
    }

    setSaving(
      true
    );

    const supabase =
      createClient();

    try {
      /* --------------------------------
         MODIFICATION
      -------------------------------- */

      if (
        form.id
      ) {
        const {
          data,
          error:
            updateError,
        } =
          await supabase
            .from(
              "districts"
            )
            .update({
              name_fr:
                nameFr ||
                null,

              name_ar:
                nameAr ||
                null,

              name_en:
                nameEn ||
                null,

              name_ru:
                nameRu ||
                null,

              latitude,

              longitude,

              active:
                form.active,

              sort_order:
                Number(
                  form.sort_order
                ) ||
                100,
            })
            .eq(
              "id",
              form.id
            )
            .select(
              `
                id,
                name,
                name_fr,
                name_ar,
                name_en,
                name_ru,
                latitude,
                longitude,
                active,
                sort_order
              `
            )
            .single();

        if (
          updateError
        ) {
          throw updateError;
        }

        const updated =
          data as District;

        setDistricts(
          (
            current
          ) =>
            current
              .map(
                (
                  item
                ) =>
                  item.id ===
                  updated.id
                    ? updated
                    : item
              )
              .sort(
                sortDistricts
              )
        );

        selectDistrict(
          updated
        );

        setSuccess(
          "Quartier enregistré."
        );

        return;
      }

      /* --------------------------------
         CRÉATION
      -------------------------------- */

      const internalName =
        nameFr ||
        nameEn ||
        nameAr ||
        nameRu;

      const {
        data,
        error:
          insertError,
      } =
        await supabase
          .from(
            "districts"
          )
          .insert({
            name:
              internalName,

            name_fr:
              nameFr ||
              null,

            name_ar:
              nameAr ||
              null,

            name_en:
              nameEn ||
              null,

            name_ru:
              nameRu ||
              null,

            latitude,

            longitude,

            active:
              form.active,

            sort_order:
              Number(
                form.sort_order
              ) ||
              100,
          })
          .select(
            `
              id,
              name,
              name_fr,
              name_ar,
              name_en,
              name_ru,
              latitude,
              longitude,
              active,
              sort_order
            `
          )
          .single();

      if (
        insertError
      ) {
        throw insertError;
      }

      const created =
        data as District;

      setDistricts(
        (
          current
        ) =>
          [
            ...current,
            created,
          ].sort(
            sortDistricts
          )
      );

      selectDistrict(
        created
      );

      setSuccess(
        "Quartier créé."
      );
    } catch (
      err
    ) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  /* ========================================
     DELETE
  ======================================== */

  async function deleteDistrict() {
    if (
      !form.id
    ) {
      return;
    }

    const confirmation =
      window.confirm(
        "Supprimer ce quartier ?"
      );

    if (
      !confirmation
    ) {
      return;
    }

    setSaving(
      true
    );

    setError("");
    setSuccess("");

    const supabase =
      createClient();

    const {
      error:
        deleteError,
    } =
      await supabase
        .from(
          "districts"
        )
        .delete()
        .eq(
          "id",
          form.id
        );

    if (
      deleteError
    ) {
      setError(
        deleteError.message
      );

      setSaving(
        false
      );

      return;
    }

    setDistricts(
      (
        current
      ) =>
        current.filter(
          (
            district
          ) =>
            district.id !==
            form.id
        )
    );

    setForm({
      ...EMPTY_FORM,
    });

    setSuccess(
      "Quartier supprimé."
    );

    setSaving(
      false
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">

      {/* =====================================
          COLONNE GAUCHE
      ===================================== */}

      <aside className="self-start rounded-3xl border border-ink/10 bg-paper p-4 lg:sticky lg:top-28">

        <button
          type="button"
          onClick={
            newDistrict
          }
          className="flex w-full items-center justify-center rounded-2xl bg-green-700 px-4 py-3 text-sm font-medium text-paper transition hover:bg-green-800"
        >
          + Nouveau quartier
        </button>

        <div className="mt-4 max-h-[65vh] space-y-1 overflow-y-auto pe-1">

          {districts.map(
            (
              district
            ) => {
              const selected =
                form.id ===
                district.id;

              return (
                <button
                  key={
                    district.id
                  }
                  type="button"
                  onClick={() =>
                    selectDistrict(
                      district
                    )
                  }
                  className={`w-full rounded-2xl px-4 py-3 text-start transition ${
                    selected
                      ? "bg-green-100 text-green-900"
                      : "text-ink hover:bg-sand"
                  }`}
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">

                      <p className="truncate text-sm font-medium">
                        {district.name_fr ||
                          district.name_en ||
                          district.name}
                      </p>

                      {district.name_ar && (
                        <p
                          dir="rtl"
                          className="mt-1 truncate text-xs text-ink-soft"
                        >
                          {
                            district.name_ar
                          }
                        </p>
                      )}

                    </div>

                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        district.active
                          ? "bg-green-500"
                          : "bg-ink/20"
                      }`}
                    />

                  </div>

                </button>
              );
            }
          )}

        </div>

      </aside>

      {/* =====================================
          CONTENU
      ===================================== */}

      <div className="space-y-6">

        {/* NOMS */}

        <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

          <div>

            <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700">
              Quartier
            </p>

            <h2 className="mt-2 font-display text-3xl font-light text-ink">
              Noms du quartier
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              Tu peux donner un nom différent pour chaque langue.
            </p>

          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">

            <TextField
              label="Français"
              value={
                form.name_fr
              }
              placeholder="Ex. Al Khalidiyyah"
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    name_fr:
                      value,
                  })
                )
              }
            />

            <TextField
              label="English"
              value={
                form.name_en
              }
              placeholder="Ex. Al Khalidiyyah"
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    name_en:
                      value,
                  })
                )
              }
            />

            <TextField
              label="العربية"
              value={
                form.name_ar
              }
              placeholder="مثال: الخالدية"
              dir="rtl"
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    name_ar:
                      value,
                  })
                )
              }
            />

            <TextField
              label="Русский"
              value={
                form.name_ru
              }
              placeholder="Например: Аль-Халидия"
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    name_ru:
                      value,
                  })
                )
              }
            />

          </div>

          {form.id && (
            <div className="mt-6 rounded-2xl bg-sand/70 px-4 py-3">

              <p className="text-xs text-ink-soft">
                Nom interne
              </p>

              <p className="mt-1 text-sm font-medium text-ink">
                {
                  form.internalName
                }
              </p>

              <p className="mt-1 text-xs leading-5 text-ink-soft">
                Celui-ci reste inchangé pour ne pas casser les annonces déjà reliées à ce quartier.
              </p>

            </div>
          )}

        </section>

        {/* COORDONNÉES */}

        <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700">
                Position approximative
              </p>

              <h2 className="mt-2 font-display text-3xl font-light text-ink">
                Latitude & longitude
              </h2>

            </div>

            <p className="max-w-sm text-sm leading-6 text-ink-soft">
              Clique sur la carte ou fais glisser le bouton ⇆ vers la gauche ou la droite.
            </p>

          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">

            <ScrubCoordinate
              label="Latitude"
              value={
                form.latitude
              }
              min={-90}
              max={90}
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    latitude:
                      value,
                  })
                )
              }
            />

            <ScrubCoordinate
              label="Longitude"
              value={
                form.longitude
              }
              min={-180}
              max={180}
              onChange={(
                value
              ) =>
                setForm(
                  (
                    current
                  ) => ({
                    ...current,
                    longitude:
                      value,
                  })
                )
              }
            />

          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10">

            <div
              ref={
                mapContainerRef
              }
              className="h-[460px] w-full bg-sand"
            />

          </div>

          <p className="mt-3 text-xs leading-5 text-ink-soft">
            Cette position représente seulement le quartier, pas l’adresse exacte d’un logement.
          </p>

        </section>

        {/* RÉGLAGES */}

        <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

          <h2 className="font-display text-2xl font-light text-ink">
            Réglages
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">

            <label className="block">

              <span className="mb-2 block text-sm font-medium text-ink">
                Ordre d’affichage
              </span>

              <input
                type="number"
                value={
                  form.sort_order
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,
                      sort_order:
                        event.target
                          .value,
                    })
                  )
                }
                className="w-full rounded-2xl border border-ink/10 bg-sand/30 px-4 py-3 text-sm text-ink outline-none transition focus:border-green-700 focus:bg-paper"
              />

            </label>

            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-ink/10 px-4 py-3">

              <input
                type="checkbox"
                checked={
                  form.active
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (
                      current
                    ) => ({
                      ...current,
                      active:
                        event.target
                          .checked,
                    })
                  )
                }
                className="h-5 w-5 accent-green-700"
              />

              <div>

                <p className="text-sm font-medium text-ink">
                  Quartier actif
                </p>

                <p className="mt-0.5 text-xs text-ink-soft">
                  Visible dans les sélecteurs et sur la carte.
                </p>

              </div>

            </label>

          </div>

        </section>

        {/* MESSAGES */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-green-700/15 bg-green-100 px-5 py-4 text-sm text-green-800">
            {success}
          </div>
        )}

        {/* ACTIONS */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            {form.id && (
              <button
                type="button"
                disabled={
                  saving
                }
                onClick={
                  deleteDistrict
                }
                className="rounded-full border border-red-200 px-5 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
              >
                Supprimer le quartier
              </button>
            )}

          </div>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              saveDistrict
            }
            className="rounded-full bg-green-700 px-8 py-3.5 text-sm font-medium text-paper transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Enregistrement..."
              : form.id
                ? "Enregistrer les modifications"
                : "Créer le quartier"}
          </button>

        </div>

      </div>

    </div>
  );
}

/* ========================================
   TEXT FIELD
======================================== */

function TextField({
  label,
  value,
  placeholder,
  dir,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  dir?: "ltr" | "rtl";
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-medium text-ink">
        {label}
      </span>

      <input
        type="text"
        value={
          value
        }
        placeholder={
          placeholder
        }
        dir={
          dir
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-2xl border border-ink/10 bg-sand/30 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/45 focus:border-green-700 focus:bg-paper"
      />

    </label>
  );
}

/* ========================================
   COORDINATE SCRUBBER
======================================== */

function ScrubCoordinate({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  onChange: (
    value: string
  ) => void;
}) {
  const dragRef =
    useRef<{
      startX: number;
      startValue: number;
    } | null>(
      null
    );

  function startDrag(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    event.preventDefault();

    const number =
      Number(
        value
      );

    dragRef.current = {
      startX:
        event.clientX,

      startValue:
        Number.isFinite(
          number
        )
          ? number
          : 0,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function drag(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    if (
      !dragRef.current
    ) {
      return;
    }

    const deltaX =
      event.clientX -
      dragRef.current
        .startX;

    /*
     * 1 pixel = 0.00005 degré
     *
     * environ quelques mètres à Médine.
     * SHIFT = déplacement plus rapide.
     * ALT = réglage très fin.
     */

    const sensitivity =
      event.altKey
        ? 0.000005
        : event.shiftKey
          ? 0.0002
          : 0.00005;

    const next =
      dragRef.current
        .startValue +
      deltaX *
        sensitivity;

    const clamped =
      Math.min(
        max,
        Math.max(
          min,
          next
        )
      );

    onChange(
      clamped.toFixed(
        6
      )
    );
  }

  function stopDrag() {
    dragRef.current =
      null;
  }

  return (
    <div>

      <div className="mb-2 flex items-center justify-between gap-3">

        <span className="text-sm font-medium text-ink">
          {label}
        </span>

        <span className="text-[11px] text-ink-soft">
          glisse ⇆
        </span>

      </div>

      <div className="flex overflow-hidden rounded-2xl border border-ink/10 bg-sand/30 transition focus-within:border-green-700 focus-within:bg-paper">

        <input
          type="text"
          inputMode="decimal"
          value={
            value
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm text-ink outline-none"
        />

        <button
          type="button"
          title="Maintiens et glisse vers la gauche ou la droite"
          onPointerDown={
            startDrag
          }
          onPointerMove={
            drag
          }
          onPointerUp={
            stopDrag
          }
          onPointerCancel={
            stopDrag
          }
          className="flex w-16 touch-none select-none items-center justify-center border-s border-ink/10 bg-paper text-lg font-medium text-green-700 transition hover:bg-green-100"
          style={{
            cursor:
              "ew-resize",
          }}
        >
          ⇆
        </button>

      </div>

    </div>
  );
}

function sortDistricts(
  a: District,
  b: District
) {
  if (
    a.sort_order !==
    b.sort_order
  ) {
    return (
      a.sort_order -
      b.sort_order
    );
  }

  return (
    a.name_fr ||
    a.name
  ).localeCompare(
    b.name_fr ||
      b.name
  );
}