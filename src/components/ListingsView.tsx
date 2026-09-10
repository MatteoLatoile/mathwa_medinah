"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import FilterBar from "./FilterBar";
import ListingCard, { type Listing } from "./ListingCard";
import { WhatsappIcon, ArchBullet } from "./icons";
import { whatsappLink } from "@/lib/site";

export default function ListingsView({ listings }: { listings: Listing[] }) {
  const t = useTranslations("listings");
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <>
      <FilterBar view={view} onViewChange={setView} />

      {listings.length === 0 ? (
        // Un écran vide est une invitation à agir, pas un message d'erreur.
        <div className="mt-8 rounded-2xl border border-dashed border-ink/20 px-6 py-16 text-center">
          <ArchBullet className="mx-auto h-9 w-6 text-ink/20" />
          <h2 className="mt-6 font-display text-2xl font-normal text-ink">
            {t("empty.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[0.9rem] leading-relaxed text-ink-soft">
            {t("empty.body")}
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-green-800"
          >
            <WhatsappIcon className="h-4 w-4" />
            {t("empty.cta")}
          </a>
        </div>
      ) : view === "list" ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex h-[60vh] items-center justify-center rounded-2xl border border-ink/10 bg-sand-deep text-sm text-ink-soft">
          {/* La carte Leaflet viendra ici, montée côté client uniquement. */}
          Leaflet
        </div>
      )}
    </>
  );
}
