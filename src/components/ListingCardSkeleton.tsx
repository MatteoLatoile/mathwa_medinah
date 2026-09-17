export default function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-ink/10 bg-paper">

      {/* IMAGE */}

      <div className="relative aspect-[4/3] overflow-hidden bg-sand-deep">

        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-sand-deep via-paper/50 to-sand-deep" />

        {/* BADGE */}

        <div className="absolute start-4 top-4 h-8 w-24 animate-pulse rounded-full bg-paper/80" />

      </div>

      {/* CONTENU */}

      <div className="p-5">

        {/* TITRE */}

        <div className="h-5 w-[82%] animate-pulse rounded-full bg-ink/10" />

        <div className="mt-2 h-5 w-[58%] animate-pulse rounded-full bg-ink/10" />

        {/* QUARTIER */}

        <div className="mt-4 flex items-center gap-2">

          <div className="h-4 w-4 animate-pulse rounded-full bg-green-700/15" />

          <div className="h-3.5 w-28 animate-pulse rounded-full bg-ink/10" />

        </div>

        {/* INFOS */}

        <div className="mt-5 flex items-center gap-4">

          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 animate-pulse rounded bg-ink/10" />
            <div className="h-3 w-12 animate-pulse rounded-full bg-ink/10" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 animate-pulse rounded bg-ink/10" />
            <div className="h-3 w-12 animate-pulse rounded-full bg-ink/10" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 animate-pulse rounded bg-ink/10" />
            <div className="h-3 w-10 animate-pulse rounded-full bg-ink/10" />
          </div>

        </div>

        {/* PRIX */}

        <div className="mt-6 flex items-end justify-between">

          <div>

            <div className="h-7 w-28 animate-pulse rounded-full bg-green-700/15" />

            <div className="mt-2 h-3 w-16 animate-pulse rounded-full bg-ink/10" />

          </div>

          <div className="h-9 w-9 animate-pulse rounded-full bg-green-100" />

        </div>

      </div>

    </div>
  );
}