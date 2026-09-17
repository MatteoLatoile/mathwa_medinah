"use client";

import DistrictSelect from "@/components/admin/DistrictSelect";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Listing = {
  id: string;
  title_fr: string | null;
  title_ar: string | null;
  title_en: string | null;
  title_ru: string | null;
  description_fr: string | null;
  description_ar: string | null;
  description_en: string | null;
  description_ru: string | null;
  district: string;
  location_label: string | null;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  living_rooms: number;
  floor: number | null;
  area_m2: number | null;
  monthly_price: number | null;
  yearly_price: number | null;
  deposit: number | null;
  furnished: boolean;
  water_included: boolean;
  electricity_included: boolean;
  internet_included: boolean;
  cleaning_included: boolean;
  air_conditioning: boolean;
  elevator: boolean;
  parking: boolean;
  kitchen: boolean;
  verified: boolean;
  featured: boolean;
  status: string;
};

type PrivateData = {
  exact_address: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_whatsapp: string | null;
  owner_notes: string | null;
  commission_type: string | null;
  commission_value: number | null;
  private_notes: string | null;
};

export default function EditListingForm({
  locale,
  listing,
  privateData,
}: {
  locale: string;
  listing: Listing;
  privateData: PrivateData | null;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const input =
    "mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-green-700";

  const textarea =
    "mt-2 min-h-32 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-green-700";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);

    const supabase = createClient();

    const status = String(form.get("status") || "draft");

    const { error: listingError } = await supabase
      .from("listings")
      .update({
        title_fr: String(form.get("title_fr") || "").trim(),
        title_ar: String(form.get("title_ar") || "").trim() || null,
        title_en: String(form.get("title_en") || "").trim() || null,
        title_ru: String(form.get("title_ru") || "").trim() || null,

        description_fr:
          String(form.get("description_fr") || "").trim() || null,

        description_ar:
          String(form.get("description_ar") || "").trim() || null,

        description_en:
          String(form.get("description_en") || "").trim() || null,

        description_ru:
          String(form.get("description_ru") || "").trim() || null,

        district: String(form.get("district") || "").trim(),

        location_label:
          String(form.get("location_label") || "").trim() || null,

        property_type: String(form.get("property_type")),

        bedrooms: Number(form.get("bedrooms") || 0),
        bathrooms: Number(form.get("bathrooms") || 0),
        living_rooms: Number(form.get("living_rooms") || 0),

        floor:
          String(form.get("floor") || "") !== ""
            ? Number(form.get("floor"))
            : null,

        area_m2:
          String(form.get("area_m2") || "") !== ""
            ? Number(form.get("area_m2"))
            : null,

        monthly_price:
          String(form.get("monthly_price") || "") !== ""
            ? Number(form.get("monthly_price"))
            : null,

        yearly_price:
          String(form.get("yearly_price") || "") !== ""
            ? Number(form.get("yearly_price"))
            : null,

        deposit:
          String(form.get("deposit") || "") !== ""
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

        status,

        published_at:
          status === "published"
            ? new Date().toISOString()
            : null,
      })
      .eq("id", listing.id);

    if (listingError) {
      setError(listingError.message);
      setLoading(false);
      return;
    }

    const privatePayload = {
      listing_id: listing.id,

      exact_address:
        String(form.get("exact_address") || "").trim() || null,

      owner_name:
        String(form.get("owner_name") || "").trim() || null,

      owner_phone:
        String(form.get("owner_phone") || "").trim() || null,

      owner_whatsapp:
        String(form.get("owner_whatsapp") || "").trim() || null,

      owner_notes:
        String(form.get("owner_notes") || "").trim() || null,

      commission_type:
        String(form.get("commission_type") || "") || null,

      commission_value:
        String(form.get("commission_value") || "") !== ""
          ? Number(form.get("commission_value"))
          : null,

      private_notes:
        String(form.get("private_notes") || "").trim() || null,
    };

    const { error: privateError } = await supabase
      .from("listing_private")
      .upsert(privatePayload);

    if (privateError) {
      setError(privateError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/admin`);
    router.refresh();
  }

  async function deleteListing() {
    const confirmDelete = window.confirm(
      "Supprimer dÃ©finitivement cet appartement ?"
    );

    if (!confirmDelete) return;

    setLoading(true);

    const supabase = createClient();

    const { data: images } = await supabase
      .from("listing_images")
      .select("storage_path")
      .eq("listing_id", listing.id);

    if (images?.length) {
      await supabase.storage
        .from("listing-images")
        .remove(images.map((image) => image.storage_path));
    }

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listing.id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/admin`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          Logement
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">

          <label className="text-sm">
            Titre franÃ§ais
            <input
              name="title_fr"
              required
              defaultValue={listing.title_fr ?? ""}
              className={input}
            />
          </label>

          <label className="text-sm">
            Quartier
            <DistrictSelect defaultValue={listing.district} />
          </label>

          <label className="text-sm">
            Localisation affichÃ©e
            <input
              name="location_label"
              defaultValue={listing.location_label ?? ""}
              className={input}
            />
          </label>

          <label className="text-sm">
            Type
            <select
              name="property_type"
              defaultValue={listing.property_type}
              className={input}
            >
              <option value="apartment">Appartement</option>
              <option value="studio">Studio</option>
              <option value="house">Maison</option>
              <option value="room">Chambre</option>
            </select>
          </label>

          <label className="text-sm">
            Chambres
            <input
              name="bedrooms"
              type="number"
              min="0"
              defaultValue={listing.bedrooms}
              className={input}
            />
          </label>

          <label className="text-sm">
            Salles de bain
            <input
              name="bathrooms"
              type="number"
              min="0"
              defaultValue={listing.bathrooms}
              className={input}
            />
          </label>

          <label className="text-sm">
            Salons
            <input
              name="living_rooms"
              type="number"
              min="0"
              defaultValue={listing.living_rooms}
              className={input}
            />
          </label>

          <label className="text-sm">
            Ã‰tage
            <input
              name="floor"
              type="number"
              defaultValue={listing.floor ?? ""}
              className={input}
            />
          </label>

          <label className="text-sm">
            Surface mÂ²
            <input
              name="area_m2"
              type="number"
              defaultValue={listing.area_m2 ?? ""}
              className={input}
            />
          </label>

        </div>
      </section>

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          Prix
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">

          <label className="text-sm">
            Mensuel
            <input
              name="monthly_price"
              type="number"
              defaultValue={listing.monthly_price ?? ""}
              className={input}
            />
          </label>

          <label className="text-sm">
            Annuel
            <input
              name="yearly_price"
              type="number"
              defaultValue={listing.yearly_price ?? ""}
              className={input}
            />
          </label>

          <label className="text-sm">
            Caution
            <input
              name="deposit"
              type="number"
              defaultValue={listing.deposit ?? ""}
              className={input}
            />
          </label>

        </div>
      </section>

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          CaractÃ©ristiques
        </h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {[
            ["furnished", "MeublÃ©", listing.furnished],
            ["water_included", "Eau incluse", listing.water_included],
            [
              "electricity_included",
              "Ã‰lectricitÃ© incluse",
              listing.electricity_included,
            ],
            [
              "internet_included",
              "Internet inclus",
              listing.internet_included,
            ],
            [
              "cleaning_included",
              "MÃ©nage inclus",
              listing.cleaning_included,
            ],
            [
              "air_conditioning",
              "Climatisation",
              listing.air_conditioning,
            ],
            ["elevator", "Ascenseur", listing.elevator],
            ["parking", "Parking", listing.parking],
            ["kitchen", "Cuisine", listing.kitchen],
            ["verified", "VÃ©rifiÃ©e", listing.verified],
            ["featured", "Mise en avant", listing.featured],
          ].map(([name, label, checked]) => (
            <label
              key={String(name)}
              className="flex items-center gap-3 rounded-xl border border-ink/10 p-4 text-sm"
            >
              <input
                type="checkbox"
                name={String(name)}
                defaultChecked={Boolean(checked)}
                className="h-4 w-4 accent-green-700"
              />

              {String(label)}
            </label>
          ))}

        </div>
      </section>

      <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          Textes
        </h2>

        <div className="mt-6 space-y-5">

          <label className="block text-sm">
            Description franÃ§aise
            <textarea
              name="description_fr"
              defaultValue={listing.description_fr ?? ""}
              className={textarea}
            />
          </label>

          <label className="block text-sm">
            Titre arabe
            <input
              dir="rtl"
              name="title_ar"
              defaultValue={listing.title_ar ?? ""}
              className={input}
            />
          </label>

          <label className="block text-sm">
            Description arabe
            <textarea
              dir="rtl"
              name="description_ar"
              defaultValue={listing.description_ar ?? ""}
              className={textarea}
            />
          </label>

          <label className="block text-sm">
            Titre anglais
            <input
              name="title_en"
              defaultValue={listing.title_en ?? ""}
              className={input}
            />
          </label>

          <label className="block text-sm">
            Description anglaise
            <textarea
              name="description_en"
              defaultValue={listing.description_en ?? ""}
              className={textarea}
            />
          </label>

          <label className="block text-sm">
            Titre russe
            <input
              name="title_ru"
              defaultValue={listing.title_ru ?? ""}
              className={input}
            />
          </label>

          <label className="block text-sm">
            Description russe
            <textarea
              name="description_ru"
              defaultValue={listing.description_ru ?? ""}
              className={textarea}
            />
          </label>

        </div>
      </section>

      <section className="rounded-3xl border border-gold/30 bg-paper p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold">
          PrivÃ©
        </p>

        <h2 className="mt-2 font-display text-2xl text-ink">
          PropriÃ©taire & commission
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">

          <label className="text-sm">
            PropriÃ©taire
            <input
              name="owner_name"
              defaultValue={privateData?.owner_name ?? ""}
              className={input}
            />
          </label>

          <label className="text-sm">
            TÃ©lÃ©phone
            <input
              name="owner_phone"
              defaultValue={privateData?.owner_phone ?? ""}
              className={input}
            />
          </label>

          <label className="text-sm">
            WhatsApp
            <input
              name="owner_whatsapp"
              defaultValue={privateData?.owner_whatsapp ?? ""}
              className={input}
            />
          </label>

          <label className="text-sm">
            Adresse exacte
            <input
              name="exact_address"
              defaultValue={privateData?.exact_address ?? ""}
              className={input}
            />
          </label>

          <label className="text-sm">
            Type de commission
            <select
              name="commission_type"
              defaultValue={privateData?.commission_type ?? ""}
              className={input}
            >
              <option value="">Aucune</option>
              <option value="fixed">Montant fixe</option>
              <option value="percentage">Pourcentage</option>
            </select>
          </label>

          <label className="text-sm">
            Commission
            <input
              name="commission_value"
              type="number"
              step="0.01"
              defaultValue={privateData?.commission_value ?? ""}
              className={input}
            />
          </label>

        </div>

        <label className="mt-5 block text-sm">
          Notes propriÃ©taire
          <textarea
            name="owner_notes"
            defaultValue={privateData?.owner_notes ?? ""}
            className={textarea}
          />
        </label>

        <label className="mt-5 block text-sm">
          Notes privÃ©es
          <textarea
            name="private_notes"
            defaultValue={privateData?.private_notes ?? ""}
            className={textarea}
          />
        </label>
      </section>

      <section className="rounded-3xl border border-ink/10 bg-paper p-6">
        <label className="text-sm font-medium">
          Statut
          <select
            name="status"
            defaultValue={listing.status}
            className={input}
          >
            <option value="draft">Brouillon</option>
            <option value="published">PubliÃ©e</option>
            <option value="rented">LouÃ©e</option>
            <option value="archived">ArchivÃ©e</option>
          </select>
        </label>
      </section>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">

        <button
          type="button"
          onClick={deleteListing}
          disabled={loading}
          className="rounded-full border border-red-200 px-6 py-3 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Supprimer
        </button>

        <div className="flex flex-col gap-3 sm:flex-row">

          <a
            href={`/${locale}/admin`}
            className="rounded-full border border-ink/15 px-6 py-3 text-center text-sm"
          >
            Annuler
          </a>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-green-700 px-8 py-3 text-sm font-medium text-paper hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>

        </div>
      </div>

    </form>
  );
}
