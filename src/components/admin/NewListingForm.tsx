"use client";

import DistrictSelect from "@/components/admin/DistrictSelect";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
};

type VideoPresignResponse = {
  key?: string;
  uploadUrl?: string;
  publicUrl?: string;
  error?: string;
};

const MAX_VIDEO_SIZE = 300 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
];

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewListingForm({
  locale,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [images, setImages] = useState<File[]>([]);

  const [video, setVideo] = useState<File | null>(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);

    const supabase = createClient();

    const titleFr = String(
      form.get("title_fr") || ""
    ).trim();

    const district = String(
      form.get("district") || ""
    ).trim();

    const monthlyPriceRaw = String(
      form.get("monthly_price") || ""
    );

    const yearlyPriceRaw = String(
      form.get("yearly_price") || ""
    );

    if (!titleFr || !district) {
      setError(
        "Le titre et le quartier sont obligatoires."
      );

      setLoading(false);

      return;
    }

    if (!monthlyPriceRaw && !yearlyPriceRaw) {
      setError(
        "Indique au moins un prix mensuel ou annuel."
      );

      setLoading(false);

      return;
    }

    if (video) {
      if (!ALLOWED_VIDEO_TYPES.includes(video.type)) {
        setError(
          "La vidéo doit être au format MP4 ou WebM."
        );

        setLoading(false);

        return;
      }

      if (video.size > MAX_VIDEO_SIZE) {
        setError(
          "La vidéo ne doit pas dépasser 300 Mo."
        );

        setLoading(false);

        return;
      }
    }

    const slugBase = createSlug(titleFr);

    const slug =
      `${slugBase}-${Date.now().toString().slice(-6)}`;

    const status = String(
      form.get("status") || "draft"
    );

    const listingData = {
      slug,
      status,

      district,

      location_label:
        String(
          form.get("location_label") || ""
        ).trim() || null,

      property_type: String(
        form.get("property_type") || "apartment"
      ),

      occupancy_type: String(
        form.get("occupancy_type") || "private"
      ),

      nabawi_distance_km:
        String(
          form.get("nabawi_distance_km") || ""
        ) !== ""
          ? Number(
              form.get("nabawi_distance_km")
            )
          : null,

      bedrooms: Number(
        form.get("bedrooms") || 0
      ),

      bathrooms: Number(
        form.get("bathrooms") || 0
      ),

      living_rooms: Number(
        form.get("living_rooms") || 0
      ),

      floor:
        form.get("floor") !== ""
          ? Number(
              form.get("floor")
            )
          : null,

      area_m2:
        form.get("area_m2") !== ""
          ? Number(
              form.get("area_m2")
            )
          : null,

      monthly_price:
        monthlyPriceRaw
          ? Number(
              monthlyPriceRaw
            )
          : null,

      yearly_price:
        yearlyPriceRaw
          ? Number(
              yearlyPriceRaw
            )
          : null,

      deposit:
        form.get("deposit") !== ""
          ? Number(
              form.get("deposit")
            )
          : null,

      furnished:
        form.get("furnished") === "on",

      water_included:
        form.get("water_included") === "on",

      electricity_included:
        form.get("electricity_included") === "on",

      internet_included:
        form.get("internet_included") === "on",

      cleaning_included:
        form.get("cleaning_included") === "on",

      air_conditioning:
        form.get("air_conditioning") === "on",

      elevator:
        form.get("elevator") === "on",

      parking:
        form.get("parking") === "on",

      kitchen:
        form.get("kitchen") === "on",

      verified:
        form.get("verified") === "on",

      featured:
        form.get("featured") === "on",

      title_fr:
        titleFr,

      title_ar:
        String(
          form.get("title_ar") || ""
        ).trim() || null,

      title_en:
        String(
          form.get("title_en") || ""
        ).trim() || null,

      title_ru:
        String(
          form.get("title_ru") || ""
        ).trim() || null,

      description_fr:
        String(
          form.get("description_fr") || ""
        ).trim() || null,

      description_ar:
        String(
          form.get("description_ar") || ""
        ).trim() || null,

      description_en:
        String(
          form.get("description_en") || ""
        ).trim() || null,

      description_ru:
        String(
          form.get("description_ru") || ""
        ).trim() || null,

      available_from:
        String(
          form.get("available_from") || ""
        ) || null,

      published_at:
        status === "published"
          ? new Date().toISOString()
          : null,
    };

    const {
      data: listing,
      error: listingError,
    } =
      await supabase
        .from("listings")
        .insert(listingData)
        .select(
          "id, reference, slug"
        )
        .single();

    if (
      listingError ||
      !listing
    ) {
      console.error(
        listingError
      );

      setError(
        listingError?.message ||
          "Impossible de créer l'annonce."
      );

      setLoading(false);

      return;
    }

    const privateData = {
      listing_id:
        listing.id,

      exact_address:
        String(
          form.get("exact_address") || ""
        ).trim() || null,

      owner_name:
        String(
          form.get("owner_name") || ""
        ).trim() || null,

      owner_phone:
        String(
          form.get("owner_phone") || ""
        ).trim() || null,

      owner_whatsapp:
        String(
          form.get("owner_whatsapp") || ""
        ).trim() || null,

      owner_notes:
        String(
          form.get("owner_notes") || ""
        ).trim() || null,

      commission_type:
        String(
          form.get("commission_type") || ""
        ) || null,

      commission_value:
        form.get("commission_value") !== ""
          ? Number(
              form.get("commission_value")
            )
          : null,

      commission_status:
        "pending",

      private_notes:
        String(
          form.get("private_notes") || ""
        ).trim() || null,
    };

    const {
      error: privateError,
    } =
      await supabase
        .from("listing_private")
        .insert(privateData);

    if (privateError) {
      console.error(
        privateError
      );

      await supabase
        .from("listings")
        .delete()
        .eq(
          "id",
          listing.id
        );

      setError(
        privateError.message
      );

      setLoading(false);

      return;
    }

    const uploadedPaths:
      string[] =
      [];

    let uploadedVideoPath:
      string | null =
      null;

    try {
      /*
       * =============================
       * PHOTOS
       * =============================
       */

      for (
        let index = 0;
        index < images.length;
        index++
      ) {
        const file =
          images[index];

        if (
          file.size >
          10 *
            1024 *
            1024
        ) {
          throw new Error(
            `L'image "${file.name}" dépasse 10 Mo.`
          );
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/avif",
        ];

        if (
          !allowedTypes.includes(
            file.type
          )
        ) {
          throw new Error(
            `Format non accepté : ${file.name}`
          );
        }

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() ||
          "jpg";

        const storagePath =
          `${listing.id}/` +
          `${String(
            index + 1
          ).padStart(
            2,
            "0"
          )}-` +
          `${crypto.randomUUID()}.${extension}`;

        const {
          error:
            uploadError,
        } =
          await supabase.storage
            .from(
              "listing-images"
            )
            .upload(
              storagePath,
              file,
              {
                cacheControl:
                  "3600",

                upsert:
                  false,

                contentType:
                  file.type,
              }
            );

        if (
          uploadError
        ) {
          throw uploadError;
        }

        uploadedPaths.push(
          storagePath
        );
      }

      if (
        uploadedPaths.length >
        0
      ) {
        const imageRows =
          uploadedPaths.map(
            (
              storagePath,
              index
            ) => ({
              listing_id:
                listing.id,

              storage_path:
                storagePath,

              position:
                index,

              is_cover:
                index === 0,
            })
          );

        const {
          error:
            imagesError,
        } =
          await supabase
            .from(
              "listing_images"
            )
            .insert(
              imageRows
            );

        if (
          imagesError
        ) {
          throw imagesError;
        }
      }

      /*
       * =============================
       * VIDÉO R2
       * =============================
       */

      if (video) {
        const signResponse =
          await fetch(
            "/api/r2/video",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  listingId:
                    listing.id,

                  fileName:
                    video.name,

                  contentType:
                    video.type,

                  fileSize:
                    video.size,
                }),
            }
          );

        const signed =
          (
            await signResponse.json()
          ) as VideoPresignResponse;

        if (
          !signResponse.ok ||
          !signed.uploadUrl ||
          !signed.key
        ) {
          throw new Error(
            signed.error ||
              "Impossible de préparer l'envoi de la vidéo."
          );
        }

        const uploadVideoResponse =
          await fetch(
            signed.uploadUrl,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  video.type,
              },

              body:
                video,
            }
          );

        if (
          !uploadVideoResponse.ok
        ) {
          throw new Error(
            "Impossible d'envoyer la vidéo vers Cloudflare."
          );
        }

        uploadedVideoPath =
          signed.key;

        const {
          error:
            videoDatabaseError,
        } =
          await supabase
            .from(
              "listings"
            )
            .update({
              video_path:
                signed.key,
            })
            .eq(
              "id",
              listing.id
            );

        if (
          videoDatabaseError
        ) {
          throw videoDatabaseError;
        }
      }
    } catch (
      uploadError
    ) {
      console.error(
        uploadError
      );

      /*
       * On nettoie la vidéo R2
       * si elle avait déjà été envoyée.
       */

      if (
        uploadedVideoPath
      ) {
        try {
          await fetch(
            "/api/r2/video",
            {
              method:
                "DELETE",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  listingId:
                    listing.id,

                  key:
                    uploadedVideoPath,

                  clearDatabase:
                    false,
                }),
            }
          );
        } catch (
          cleanupError
        ) {
          console.error(
            cleanupError
          );
        }
      }

      /*
       * On nettoie les photos.
       */

      if (
        uploadedPaths.length >
        0
      ) {
        await supabase.storage
          .from(
            "listing-images"
          )
          .remove(
            uploadedPaths
          );
      }

      /*
       * Puis on supprime
       * l'annonce créée.
       */

      await supabase
        .from(
          "listings"
        )
        .delete()
        .eq(
          "id",
          listing.id
        );

      setError(
        uploadError instanceof
          Error
          ? uploadError.message
          : "Erreur pendant l'envoi des médias."
      );

      setLoading(false);

      return;
    }

    router.replace(
      `/${locale}/admin`
    );

    router.refresh();
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-green-700";

  const textareaClass =
    "mt-2 min-h-32 w-full resize-y rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none transition focus:border-green-700";

  const checkboxClass =
    "h-4 w-4 rounded border-ink/20 accent-green-700";

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-8"
    >
      {/* =========================
          INFORMATIONS
      ========================= */}

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

        <h2 className="font-display text-2xl text-ink">
          Informations principales
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">

          <label className="text-sm text-ink">
            Titre français *

            <input
              name="title_fr"
              required
              className={
                inputClass
              }
              placeholder="Appartement meublé à Khalidiyyah"
            />
          </label>

          <label className="text-sm text-ink">
            Quartier *

            <DistrictSelect />
          </label>

          <label className="text-sm text-ink">
            Localisation affichée

            <input
              name="location_label"
              className={
                inputClass
              }
              placeholder="Proche de..."
            />
          </label>

          <label className="text-sm text-ink">
            Type

            <select
              name="property_type"
              className={
                inputClass
              }
              defaultValue="apartment"
            >
              <option value="apartment">
                Appartement
              </option>

              <option value="studio">
                Studio
              </option>

              <option value="house">
                Maison
              </option>

              <option value="room">
                Chambre
              </option>
            </select>
          </label>

          <label className="text-sm text-ink">
            Type de location

            <select
              name="occupancy_type"
              className={
                inputClass
              }
              defaultValue="private"
            >
              <option value="private">
                Logement entier
              </option>

              <option value="shared_women">
                Colocation femmes
              </option>

              <option value="shared_men">
                Colocation hommes
              </option>
            </select>
          </label>

          <label className="text-sm text-ink">
            Distance du Masjid Nabawi (km)

            <input
              name="nabawi_distance_km"
              type="number"
              min="0"
              step="0.01"
              className={
                inputClass
              }
              placeholder="Ex. 2.5"
            />
          </label>

          <label className="text-sm text-ink">
            Chambres

            <input
              name="bedrooms"
              type="number"
              min="0"
              defaultValue="1"
              className={
                inputClass
              }
            />
          </label>

          <label className="text-sm text-ink">
            Salles de bain

            <input
              name="bathrooms"
              type="number"
              min="0"
              defaultValue="1"
              className={
                inputClass
              }
            />
          </label>

          <label className="text-sm text-ink">
            Salons

            <input
              name="living_rooms"
              type="number"
              min="0"
              defaultValue="1"
              className={
                inputClass
              }
            />
          </label>

          <label className="text-sm text-ink">
            Étage

            <input
              name="floor"
              type="number"
              className={
                inputClass
              }
            />
          </label>

          <label className="text-sm text-ink">
            Surface m²

            <input
              name="area_m2"
              type="number"
              min="1"
              className={
                inputClass
              }
            />
          </label>

          <label className="text-sm text-ink">
            Disponible à partir du

            <input
              name="available_from"
              type="date"
              className={
                inputClass
              }
            />
          </label>

        </div>

      </section>

      {/* =========================
          PRIX
      ========================= */}

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

        <h2 className="font-display text-2xl text-ink">
          Prix
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">

          <label className="text-sm text-ink">
            Prix mensuel

            <input
              name="monthly_price"
              type="number"
              min="0"
              className={
                inputClass
              }
              placeholder="1500"
            />
          </label>

          <label className="text-sm text-ink">
            Prix annuel

            <input
              name="yearly_price"
              type="number"
              min="0"
              className={
                inputClass
              }
              placeholder="18000"
            />
          </label>

          <label className="text-sm text-ink">
            Caution

            <input
              name="deposit"
              type="number"
              min="0"
              className={
                inputClass
              }
              placeholder="500"
            />
          </label>

        </div>

      </section>

      {/* =========================
          ÉQUIPEMENTS
      ========================= */}

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

        <h2 className="font-display text-2xl text-ink">
          Équipements et inclus
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {[
            [
              "furnished",
              "Meublé",
            ],

            [
              "water_included",
              "Eau incluse",
            ],

            [
              "electricity_included",
              "Électricité incluse",
            ],

            [
              "internet_included",
              "Internet inclus",
            ],

            [
              "cleaning_included",
              "Ménage inclus",
            ],

            [
              "air_conditioning",
              "Climatisation",
            ],

            [
              "elevator",
              "Ascenseur",
            ],

            [
              "parking",
              "Parking",
            ],

            [
              "kitchen",
              "Cuisine",
            ],

            [
              "verified",
              "Annonce vérifiée",
            ],

            [
              "featured",
              "Mettre en avant",
            ],
          ].map(
            (
              [
                name,
                label,
              ]
            ) => (

              <label
                key={
                  name
                }
                className="flex items-center gap-3 rounded-xl border border-ink/10 px-4 py-3 text-sm text-ink"
              >

                <input
                  type="checkbox"
                  name={
                    name
                  }
                  className={
                    checkboxClass
                  }
                  defaultChecked={
                    name ===
                    "kitchen"
                  }
                />

                {
                  label
                }

              </label>

            )
          )}

        </div>

      </section>

      {/* =========================
          PHOTOS
      ========================= */}

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

        <h2 className="font-display text-2xl text-ink">
          Photos
        </h2>

        <p className="mt-2 text-sm text-ink-soft">
          La première photo sera la couverture.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={
            loading
          }
          onChange={(
            event
          ) =>
            setImages(
              Array.from(
                event.target.files ||
                  []
              )
            )
          }
          className="mt-6 block w-full rounded-xl border border-dashed border-ink/20 bg-sand p-5 text-sm text-ink"
        />

        {images.length >
          0 && (

          <p className="mt-3 text-sm text-green-700">
            {images.length}{" "}
            photo
            {images.length >
            1
              ? "s"
              : ""}{" "}
            sélectionnée
            {images.length >
            1
              ? "s"
              : ""}
          </p>

        )}

      </section>

      {/* =========================
          VIDÉO
      ========================= */}

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

        <div>

          <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700">
            Média
          </p>

          <h2 className="mt-2 font-display text-2xl text-ink">
            Vidéo de présentation
          </h2>

          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Facultatif · MP4 ou WebM · 300 Mo maximum.
            La vidéo apparaîtra à côté des photos avec le bouton Play.
          </p>

        </div>

        <input
          type="file"
          accept="video/mp4,video/webm"
          disabled={
            loading
          }
          onChange={(
            event
          ) => {
            const selected =
              event.target.files?.[0] ??
              null;

            setVideo(
              selected
            );
          }}
          className="mt-6 block w-full rounded-xl border border-dashed border-ink/20 bg-sand p-5 text-sm text-ink"
        />

        {video && (

          <div className="mt-4 rounded-2xl border border-green-700/15 bg-green-100 p-4">

            <p className="text-sm font-medium text-green-900">
              Vidéo sélectionnée
            </p>

            <p className="mt-1 break-all text-sm text-green-800">
              {
                video.name
              }
            </p>

            <p className="mt-1 text-xs text-green-700">
              {(
                video.size /
                1024 /
                1024
              ).toFixed(
                1
              )}{" "}
              Mo
            </p>

            <button
              type="button"
              disabled={
                loading
              }
              onClick={() =>
                setVideo(
                  null
                )
              }
              className="mt-3 text-xs font-medium text-red-700 underline underline-offset-2"
            >
              Retirer la vidéo
            </button>

          </div>

        )}

      </section>

      {/* =========================
          TRADUCTIONS
      ========================= */}

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

        <h2 className="font-display text-2xl text-ink">
          Traductions
        </h2>

        <div className="mt-6 space-y-6">

          <label className="block text-sm text-ink">
            Titre arabe

            <input
              name="title_ar"
              dir="rtl"
              className={
                inputClass
              }
            />
          </label>

          <label className="block text-sm text-ink">
            Titre anglais

            <input
              name="title_en"
              className={
                inputClass
              }
            />
          </label>

          <label className="block text-sm text-ink">
            Titre russe

            <input
              name="title_ru"
              className={
                inputClass
              }
            />
          </label>

          <label className="block text-sm text-ink">
            Description française

            <textarea
              name="description_fr"
              className={
                textareaClass
              }
            />
          </label>

          <label className="block text-sm text-ink">
            Description arabe

            <textarea
              name="description_ar"
              dir="rtl"
              className={
                textareaClass
              }
            />
          </label>

          <label className="block text-sm text-ink">
            Description anglaise

            <textarea
              name="description_en"
              className={
                textareaClass
              }
            />
          </label>

          <label className="block text-sm text-ink">
            Description russe

            <textarea
              name="description_ru"
              className={
                textareaClass
              }
            />
          </label>

        </div>

      </section>

      {/* =========================
          PROPRIÉTAIRE
      ========================= */}

      <section className="rounded-3xl border border-gold/30 bg-paper p-6 sm:p-8">

        <div>

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            Privé
          </p>

          <h2 className="mt-2 font-display text-2xl text-ink">
            Propriétaire
          </h2>

        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">

          <label className="text-sm text-ink">
            Nom du propriétaire

            <input
              name="owner_name"
              className={
                inputClass
              }
            />
          </label>

          <label className="text-sm text-ink">
            Téléphone

            <input
              name="owner_phone"
              className={
                inputClass
              }
            />
          </label>

          <label className="text-sm text-ink">
            WhatsApp

            <input
              name="owner_whatsapp"
              className={
                inputClass
              }
              placeholder="+966..."
            />
          </label>

          <label className="text-sm text-ink">
            Adresse exacte

            <input
              name="exact_address"
              className={
                inputClass
              }
            />
          </label>

          <label className="text-sm text-ink">
            Type de commission

            <select
              name="commission_type"
              className={
                inputClass
              }
              defaultValue=""
            >

              <option value="">
                Aucune pour le moment
              </option>

              <option value="fixed">
                Montant fixe
              </option>

              <option value="percentage">
                Pourcentage
              </option>

            </select>

          </label>

          <label className="text-sm text-ink">
            Commission

            <input
              name="commission_value"
              type="number"
              min="0"
              step="0.01"
              className={
                inputClass
              }
            />
          </label>

        </div>

        <label className="mt-5 block text-sm text-ink">
          Notes propriétaire

          <textarea
            name="owner_notes"
            className={
              textareaClass
            }
          />
        </label>

        <label className="mt-5 block text-sm text-ink">
          Notes privées

          <textarea
            name="private_notes"
            className={
              textareaClass
            }
          />
        </label>

      </section>

      {/* =========================
          STATUT
      ========================= */}

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

        <label className="block text-sm font-medium text-ink">
          Statut

          <select
            name="status"
            defaultValue="draft"
            className={
              inputClass
            }
          >

            <option value="draft">
              Brouillon
            </option>

            <option value="published">
              Publier immédiatement
            </option>

          </select>

        </label>

      </section>

      {error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {
            error
          }
        </div>

      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

        <a
          href={`/${locale}/admin`}
          className="rounded-full border border-ink/15 px-7 py-3 text-center text-sm font-medium text-ink transition hover:bg-paper"
        >
          Annuler
        </a>

        <button
          type="submit"
          disabled={
            loading
          }
          className="rounded-full bg-green-700 px-8 py-3 text-sm font-medium text-paper transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? video
              ? "Envoi des photos et de la vidéo..."
              : "Enregistrement..."
            : "Enregistrer l'appartement"}
        </button>

      </div>

    </form>
  );
}