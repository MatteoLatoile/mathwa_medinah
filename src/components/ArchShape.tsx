import { ARCH_APERTURE, ARCH_VIEWBOX } from "@/lib/arch";
import type { ReactNode } from "react";

/**
 * L'ouverture de l'arche, réutilisée partout : hero, cadres, masques photo.
 * `id` doit être unique par instance pour que le clipPath ne se marche pas dessus.
 */
export function ArchClip({ id }: { id: string }) {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          {/* Ramène la boîte englobante de l'ouverture sur 0 → 1 */}
          <path
            d={ARCH_APERTURE}
            transform="scale(0.00176211 0.00116673) translate(-343.7 -273.7)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Un bloc dont le contenu est découpé en forme d'arche. */
export function ArchFrame({
  id,
  className = "",
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <>
      <ArchClip id={id} />
      <div className={className} style={{ clipPath: `url(#${id})` }}>
        {children}
      </div>
    </>
  );
}

/** Le contour de l'arche, en trait, pour les usages décoratifs discrets. */
export function ArchOutline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={ARCH_VIEWBOX}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path d={ARCH_APERTURE} stroke="currentColor" strokeWidth="14" />
    </svg>
  );
}
