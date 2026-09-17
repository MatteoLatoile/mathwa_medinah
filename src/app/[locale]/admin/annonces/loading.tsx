import ListingCardSkeleton from "@/components/ListingCardSkeleton";

export default function ListingsLoading() {
  return (
    <main className="min-h-screen bg-sand px-5 pb-24 pt-28 sm:px-8 sm:pt-32">

      <div className="mx-auto max-w-7xl">

        {/* TITRE */}

        <div className="max-w-xl">

          <div className="h-4 w-40 animate-pulse rounded-full bg-green-700/15" />

          <div className="mt-4 h-11 w-[85%] max-w-[420px] animate-pulse rounded-2xl bg-ink/10" />

          <div className="mt-4 h-4 w-[70%] animate-pulse rounded-full bg-ink/10" />

        </div>

        {/* FILTRES */}

        <div className="mt-10 flex flex-wrap gap-3">

          <div className="h-11 w-40 animate-pulse rounded-full bg-paper" />

          <div className="h-11 w-32 animate-pulse rounded-full bg-paper" />

          <div className="h-11 w-32 animate-pulse rounded-full bg-paper" />

          <div className="h-11 w-36 animate-pulse rounded-full bg-paper" />

          <div className="h-11 w-28 animate-pulse rounded-full bg-paper" />

        </div>

        {/* COMPTEUR */}

        <div className="mt-8 h-4 w-36 animate-pulse rounded-full bg-ink/10" />

        {/* CARTES */}

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {Array.from({
            length: 9,
          }).map(
            (
              _,
              index
            ) => (
              <ListingCardSkeleton
                key={
                  index
                }
              />
            )
          )}

        </div>

      </div>

    </main>
  );
}