"use client";

import DistrictSelect from "@/components/admin/DistrictSelect";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
};

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewListingForm({ locale }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);

    const supabase = createClient();

    const titleFr = String(form.get("title_fr") || "").trim();
    const district = String(form.get("district") || "").trim();

    const monthlyPriceRaw = String(form.get("monthly_price") || "");
    const yearlyPriceRaw = String(form.get("yearly_price") || "");

    if (!titleFr || !district) {
      setError("Le titre et le quartier sont obligatoires.");
      setLoading(false);
      return;
    }

    if (!monthlyPriceRaw && !yearlyPriceRaw) {
      setError("Indique au moins un prix mensuel ou annuel.");
      setLoading(false);
      return;
    }

    const slugBase = createSlug(titleFr);

    const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;

    const status = String(form.get("status") || "draft");

    const listingData = {
      slug,
      status,

      district,
      location_label:
        String(form.get("location_label") || "").trim() || null,

      property_type: String(
        form.get("property_type") || "apartment"
      ),

      bedrooms: Number(form.get("bedrooms") || 0),
      bathrooms: Number(form.get("bathrooms") || 0),
      living_rooms: Number(form.get("living_rooms") || 0),

      floor:
        form.get("floor") !== ""
          ? Number(form.get("floor"))
          : null,

      area_m2:
        form.get("area_m2") !== ""
          ? Number(form.get("area_m2"))
          : null,

      monthly_price: monthlyPriceRaw
        ? Number(monthlyPriceRaw)
        : null,

      yearly_price: yearlyPriceRaw
        ? Number(yearlyPriceRaw)
        : null,

      deposit:
        form.get("deposit") !== ""
          ? Number(form.get("deposit"))
          : null,

      furnished: form.get("furnished") === "on",

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

      title_fr: titleFr,

      title_ar:
        String(form.get("title_ar") || "").trim() || null,

      title_en:
        String(form.get("title_en") || "").trim() || null,

      title_ru:
        String(form.get("title_ru") || "").trim() || null,

      description_fr:
        String(form.get("description_fr") || "").trim() ||
        null,

      description_ar:
        String(form.get("description_ar") || "").trim() ||
        null,

      description_en:
        String(form.get("description_en") || "").trim() ||
        null,

      description_ru:
        String(form.get("description_ru") || "").trim() ||
        null,

      available_from:
        String(form.get("available_from") || "") || null,

      published_at:
        status === "published"
          ? new Date().toISOString()
          : null,
    };

    const {
      data: listing,
      error: listingError,
    } = await supabase
      .from("listings")
      .insert(listingData)
      .select("id, reference, slug")
      .single();

    if (listingError || !listing) {
      console.error(listingError);

      setError(
        listingError?.message ||
          "Impossible de crÃ©er l'annonce."
      );

      setLoading(false);
      return;
    }

    const privateData = {
      listing_id: listing.id,

      exact_address:
        String(form.get("exact_address") || "").trim() ||
        null,

      owner_name:
        String(form.get("owner_name") || "").trim() ||
        null,

      owner_phone:
        String(form.get("owner_phone") || "").trim() ||
        null,

      owner_whatsapp:
        String(form.get("owner_whatsapp") || "").trim() ||
        null,

      owner_notes:
        String(form.get("owner_notes") || "").trim() ||
        null,

      commission_type:
        String(form.get("commission_type") || "") || null,

      commission_value:
        form.get("commission_value") !== ""
          ? Number(form.get("commission_value"))
          : null,

      commission_status: "pending",

      private_notes:
        String(form.get("private_notes") || "").trim() ||
        null,
    };

    const { error: privateError } = await supabase
      .from("listing_private")
      .insert(privateData);

    if (privateError) {
      console.error(privateError);

      await supabase
        .from("listings")
        .delete()
        .eq("id", listing.id);

      setError(privateError.message);
      setLoading(false);
      return;
    }

    const uploadedPaths: string[] = [];

    try {
      for (let index = 0; index < images.length; index++) {
        const file = images[index];

        if (file.size > 10 * 1024 * 1024) {
          throw new Error(
            `L'image "${file.name}" dÃ©passe 10 Mo.`
          );
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/avif",
        ];

        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            `Format non acceptÃ© : ${file.name}`
          );
        }

        const extension =
          file.name.split(".").pop()?.toLowerCase() ||
          "jpg";

        const storagePath =
          `${listing.id}/` +
          `${String(index + 1).padStart(2, "0")}-` +
          `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("listing-images")
            .upload(storagePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPaths.push(storagePath);
      }

      if (uploadedPaths.length > 0) {
        const imageRows = uploadedPaths.map(
          (storagePath, index) => ({
            listing_id: listing.id,
            storage_path: storagePath,
            position: index,
            is_cover: index === 0,
          })
        );

        const { error: imagesError } = await supabase
          .from("listing_images")
          .insert(imageRows);

        if (imagesError) {
          throw imagesError;
        }
      }
    } catch (uploadError) {
      console.error(uploadError);

      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("listing-images")
          .remove(uploadedPaths);
      }

      await supabase
        .from("listings")
        .delete()
        .eq("id", listing.id);

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Erreur pendant l'envoi des photos."
      );

      setLoading(false);
      return;
    }

    router.replace(`/${locale}/admin`);
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
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          Informations principales
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-ink">
            Titre franÃ§ais *
            <input
              name="title_fr"
              required
              className={inputClass}
              placeholder="Appartement meublÃ© Ã  Khalidiyyah"
            />
          </label>

          <label className="text-sm text-ink">
            Quartier *
            <DistrictSelect />
          </label>

          <label className="text-sm text-ink">
            Localisation affichÃ©e
            <input
              name="location_label"
              className={inputClass}
              placeholder="Proche de..."
            />
          </label>

          <label className="text-sm text-ink">
            Type
            <select
              name="property_type"
              className={inputClass}
              defaultValue="apartment"
            >
              <option value="apartment">
                Appartement
              </option>
              <option value="studio">Studio</option>
              <option value="house">Maison</option>
              <option value="room">Chambre</option>
            </select>
          </label>

          <label className="text-sm text-ink">
            Chambres
            <input
              name="bedrooms"
              type="number"
              min="0"
              defaultValue="1"
              className={inputClass}
            />
          </label>

          <label className="text-sm text-ink">
            Salles de bain
            <input
              name="bathrooms"
              type="number"
              min="0"
              defaultValue="1"
              className={inputClass}
            />
          </label>

          <label className="text-sm text-ink">
            Salons
            <input
              name="living_rooms"
              type="number"
              min="0"
              defaultValue="1"
              className={inputClass}
            />
          </label>

          <label className="text-sm text-ink">
            Ã‰tage
            <input
              name="floor"
              type="number"
              className={inputClass}
            />
          </label>

          <label className="text-sm text-ink">
            Surface mÂ²
            <input
              name="area_m2"
              type="number"
              min="1"
              className={inputClass}
            />
          </label>

          <label className="text-sm text-ink">
            Disponible Ã  partir du
            <input
              name="available_from"
              type="date"
              className={inputClass}
            />
          </label>
        </div>
      </section>

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
              className={inputClass}
              placeholder="1500"
            />
          </label>

          <label className="text-sm text-ink">
            Prix annuel
            <input
              name="yearly_price"
              type="number"
              min="0"
              className={inputClass}
              placeholder="18000"
            />
          </label>

          <label className="text-sm text-ink">
            Caution
            <input
              name="deposit"
              type="number"
              min="0"
              className={inputClass}
              placeholder="500"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          Ã‰quipements et inclus
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["furnished", "MeublÃ©"],
            ["water_included", "Eau incluse"],
            [
              "electricity_included",
              "Ã‰lectricitÃ© incluse",
            ],
            ["internet_included", "Internet inclus"],
            ["cleaning_included", "MÃ©nage inclus"],
            ["air_conditioning", "Climatisation"],
            ["elevator", "Ascenseur"],
            ["parking", "Parking"],
            ["kitchen", "Cuisine"],
            ["verified", "Annonce vÃ©rifiÃ©e"],
            ["featured", "Mettre en avant"],
          ].map(([name, label]) => (
            <label
              key={name}
              className="flex items-center gap-3 rounded-xl border border-ink/10 px-4 py-3 text-sm text-ink"
            >
              <input
                type="checkbox"
                name={name}
                className={checkboxClass}
                defaultChecked={name === "kitchen"}
              />

              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          Photos
        </h2>

        <p className="mt-2 text-sm text-ink-soft">
          La premiÃ¨re photo sera la couverture.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(event) =>
            setImages(
              Array.from(event.target.files || [])
            )
          }
          className="mt-6 block w-full rounded-xl border border-dashed border-ink/20 bg-sand p-5 text-sm text-ink"
        />

        {images.length > 0 && (
          <p className="mt-3 text-sm text-green-700">
            {images.length} photo
            {images.length > 1 ? "s" : ""} sÃ©lectionnÃ©e
            {images.length > 1 ? "s" : ""}
          </p>
        )}
      </section>

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
              className={inputClass}
            />
          </label>

          <label className="block text-sm text-ink">
            Titre anglais
            <input
              name="title_en"
              className={inputClass}
            />
          </label>

          <label className="block text-sm text-ink">
            Titre russe
            <input
              name="title_ru"
              className={inputClass}
            />
          </label>

          <label className="block text-sm text-ink">
            Description franÃ§aise
            <textarea
              name="description_fr"
              className={textareaClass}
            />
          </label>

          <label className="block text-sm text-ink">
            Description arabe
            <textarea
              name="description_ar"
              dir="rtl"
              className={textareaClass}
            />
          </label>

          <label className="block text-sm text-ink">
            Description anglaise
            <textarea
              name="description_en"
              className={textareaClass}
            />
          </label>

          <label className="block text-sm text-ink">
            Description russe
            <textarea
              name="description_ru"
              className={textareaClass}
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-gold/30 bg-paper p-6 sm:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
            PrivÃ©
          </p>

          <h2 className="mt-2 font-display text-2xl text-ink">
            PropriÃ©taire
          </h2>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-ink">
            Nom du propriÃ©taire
            <input
              name="owner_name"
              className={inputClass}
            />
          </label>

          <label className="text-sm text-ink">
            TÃ©lÃ©phone
            <input
              name="owner_phone"
              className={inputClass}
            />
          </label>

          <label className="text-sm text-ink">
            WhatsApp
            <input
              name="owner_whatsapp"
              className={inputClass}
              placeholder="+966..."
            />
          </label>

          <label className="text-sm text-ink">
            Adresse exacte
            <input
              name="exact_address"
              className={inputClass}
            />
          </label>

          <label className="text-sm text-ink">
            Type de commission
            <select
              name="commission_type"
              className={inputClass}
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
              className={inputClass}
            />
          </label>
        </div>

        <label className="mt-5 block text-sm text-ink">
          Notes propriÃ©taire
          <textarea
            name="owner_notes"
            className={textareaClass}
          />
        </label>

        <label className="mt-5 block text-sm text-ink">
          Notes privÃ©es
          <textarea
            name="private_notes"
            className={textareaClass}
          />
        </label>
      </section>

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">
        <label className="block text-sm font-medium text-ink">
          Statut
          <select
            name="status"
            defaultValue="draft"
            className={inputClass}
          >
            <option value="draft">
              Brouillon
            </option>

            <option value="published">
              Publier immÃ©diatement
            </option>
          </select>
        </label>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
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
          disabled={loading}
          className="rounded-full bg-green-700 px-8 py-3 text-sm font-medium text-paper transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Enregistrement..."
            : "Enregistrer l'appartement"}
        </button>
      </div>
    </form>
  );
}
