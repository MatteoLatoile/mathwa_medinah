import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArchBullet } from "./icons";

export type Listing = {
  id: string;
  title: string;
  district: string;
  price: number;
  period: "month" | "year";
  rooms: number;
  bathrooms: number;
  floor: string;
  walkMinutes?: number;
  verified: boolean;
  rented: boolean;
  photo?: string;
};

/**
 * Carte d'annonce. Prête à recevoir les données Supabase :
 * le composant ne fait aucune requête, il affiche ce qu'on lui passe.
 */
export default function ListingCard({ listing }: { listing: Listing }) {
  const t = useTranslations("badges");

  return (
    <Link
      href={`/annonces/${listing.id}`}
      className={`group block overflow-hidden rounded-2xl border border-ink/10 bg-paper transition-shadow hover:shadow-[0_6px_24px_rgba(18,33,28,0.09)] ${
        listing.rented ? "opacity-60" : ""
      }`}
    >
      <div className="relative aspect-[4/3] bg-sand-deep">
        {listing.photo ? (
          <img
            src={listing.photo}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ArchBullet className="h-10 w-7 text-ink/15" />
          </div>
        )}

        <span
          className={`absolute start-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${
            listing.rented
              ? "bg-ink/70 text-sand"
              : listing.verified
                ? "bg-green-100 text-green-800"
                : "bg-paper/90 text-ink-soft"
          }`}
        >
          {listing.rented
            ? t("rented")
            : listing.verified
              ? t("verified")
              : t("notVerified")}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-[0.95rem] font-medium leading-snug text-ink">
          {listing.title}
        </h3>
        <p className="mt-1 text-sm text-ink-soft">{listing.district}</p>

        <p className="mt-3 text-sm text-ink-soft">
          {listing.rooms} · {listing.bathrooms} · {listing.floor}
        </p>

        <p className="mt-3 font-medium text-green-700">
          {listing.price.toLocaleString()} ريال{" "}
          <span className="text-sm font-normal text-ink-soft">
            {listing.period === "month" ? t("perMonth") : t("perYear")}
          </span>
        </p>
      </div>
    </Link>
  );
}
