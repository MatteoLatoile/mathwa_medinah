"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { ArchBullet } from "./icons";

type Labels = {
  /** Déjà formaté côté serveur (ex. "Voir les 8 photos") — jamais une fonction :
   *  un composant client ne peut pas recevoir de fonction depuis un composant serveur. */
  viewAllLabel: string;
  close: string;
  previous: string;
  next: string;
};

/**
 * Galerie de la fiche annonce.
 * Une grande photo + une grille de vignettes, et un visualiseur plein écran
 * navigable au clavier (flèches, Échap). Se dégrade proprement à 0 ou 1 photo.
 */
export default function ListingGallery({
  photos,
  alt,
  labels,
}: {
  photos: string[];
  alt: string;
  labels: Labels;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const go = useCallback(
    (dir: 1 | -1) => {
      setActive((i) => (i + dir + photos.length) % photos.length);
    },
    [photos.length],
  );

  useEffect(() => {
    if (!lightbox) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };

    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, go]);

  if (photos.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-3xl bg-sand-deep sm:h-[480px]">
        <ArchBullet className="h-14 w-9 text-ink/15" />
      </div>
    );
  }

  const rest = photos.slice(1, 5);
  const extra = photos.length - 5;

  return (
    <>
      <div className="grid gap-2.5 sm:grid-cols-[1.6fr_1fr]">
        <button
          type="button"
          onClick={() => {
            setActive(0);
            setLightbox(true);
          }}
          className="group relative aspect-[4/3] overflow-hidden rounded-3xl sm:aspect-auto"
        >
          <img
            src={photos[0]}
            alt={alt}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
          />
          <span className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/10" />
        </button>

        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-rows-2">
            {rest.map((photo, i) => (
              <button
                key={photo}
                type="button"
                onClick={() => {
                  setActive(i + 1);
                  setLightbox(true);
                }}
                className="group relative aspect-square overflow-hidden rounded-2xl sm:aspect-auto"
              >
                <img
                  src={photo}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
                />
                {i === rest.length - 1 && extra > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-sm font-medium text-paper">
                    +{extra}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <button
          type="button"
          onClick={() => {
            setActive(0);
            setLightbox(true);
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm text-ink transition-colors hover:border-ink/30"
        >
          <Expand className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.viewAllLabel}
        </button>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/92 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label={labels.close}
            className="absolute end-4 top-4 rounded-full bg-paper/10 p-2.5 text-paper transition-colors hover:bg-paper/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label={labels.previous}
              className="absolute start-4 rounded-full bg-paper/10 p-3 text-paper transition-colors hover:bg-paper/20"
            >
              <ChevronLeft className="h-6 w-6 rtl:rotate-180" aria-hidden="true" />
            </button>
          )}

          <img
            src={photos[active]}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[88vw] rounded-lg object-contain"
          />

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label={labels.next}
              className="absolute end-4 rounded-full bg-paper/10 p-3 text-paper transition-colors hover:bg-paper/20"
            >
              <ChevronRight className="h-6 w-6 rtl:rotate-180" aria-hidden="true" />
            </button>
          )}

          {photos.length > 1 && (
            <span className="absolute bottom-6 rounded-full bg-paper/10 px-3 py-1 text-xs text-paper">
              {active + 1} / {photos.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
