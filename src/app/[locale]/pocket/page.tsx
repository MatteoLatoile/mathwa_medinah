import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Plus,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

function formatPrice(
  monthly:
    number | null,
  yearly:
    number | null
) {
  if (
    monthly !== null
  ) {
    return `${Number(
      monthly
    ).toLocaleString(
      "fr-FR"
    )} SAR/mois`;
  }

  if (
    yearly !== null
  ) {
    return `${Number(
      yearly
    ).toLocaleString(
      "fr-FR"
    )} SAR/an`;
  }

  return "Prix sur demande";
}

function statusLabel(
  status: string
) {
  switch (status) {
    case "published":
      return "Publiée";

    case "rented":
      return "Louée";

    case "archived":
      return "Archivée";

    default:
      return "Brouillon";
  }
}

function statusClass(
  status: string
) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800";

    case "rented":
      return "bg-gold/15 text-ink";

    case "archived":
      return "bg-ink/5 text-ink-soft";

    default:
      return "bg-sand-deep text-ink-soft";
  }
}

function prospectStatus(
  status: string
) {
  switch (status) {
    case "new":
      return "Nouveau";

    case "contacted":
      return "Contacté";

    case "visit_scheduled":
      return "Visite prévue";

    case "visited":
      return "Visité";

    case "rented":
      return "Loué";

    case "lost":
      return "Perdu";

    default:
      return status;
  }
}

export default async function PocketHome({
  params,
}: {
  params:
    Promise<{
      locale: string;
    }>;
}) {
  const {
    locale,
  } =
    await params;

  const supabase =
    await createClient();

  const [
    recentResult,
    totalResult,
    publishedResult,
    draftResult,
    rentedResult,
    prospectsCountResult,
    scheduledResult,
    prospectsResult,
    telegramFailedResult,
  ] =
    await Promise.all([
      supabase
        .from("listings")
        .select(`
          id,
          reference,
          title_fr,
          district,
          status,
          monthly_price,
          yearly_price,
          created_at
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(5),

      supabase
        .from("listings")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        ),

      supabase
        .from("listings")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "status",
          "published"
        ),

      supabase
        .from("listings")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "status",
          "draft"
        ),

      supabase
        .from("listings")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "status",
          "rented"
        ),

      supabase
        .from("prospects")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        ),

      supabase
        .from("prospects")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "status",
          "visit_scheduled"
        ),

      supabase
        .from("prospects")
        .select(`
          id,
          reference,
          name,
          phone,
          status,
          visit_at,
          created_at
        `)
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(3),

      supabase
        .from(
          "telegram_listing_posts"
        )
        .select(
          "listing_id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "status",
          "failed"
        ),
    ]);

  const listings =
    recentResult.data ??
    [];

  const prospects =
    prospectsResult.data ??
    [];

  const telegramFailed =
    telegramFailedResult.count ??
    0;

  return (
    <div>
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-green-700">
            Mathwa
          </p>

          <h1 className="mt-1 font-display text-[2rem] font-light leading-none text-ink">
            Pocket
          </h1>

          <p className="mt-2 text-sm text-ink-soft">
            Ton activité en un coup d&apos;œil.
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-900 text-lg font-semibold text-paper">
          M
        </div>
      </header>

      <a
        href={`/${locale}/admin/annonces/nouvelle`}
        className="mt-6 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-green-700 px-5 text-sm font-semibold text-paper shadow-[0_8px_24px_rgba(6,57,46,0.16)]"
      >
        <Plus className="h-5 w-5" />
        Ajouter un logement
      </a>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <StatCard
          icon={Building2}
          label="Total"
          value={
            totalResult.count ??
            0
          }
        />

        <StatCard
          icon={CheckCircle2}
          label="Publiées"
          value={
            publishedResult.count ??
            0
          }
        />

        <StatCard
          icon={Clock3}
          label="Brouillons"
          value={
            draftResult.count ??
            0
          }
        />

        <StatCard
          icon={CircleDollarSign}
          label="Louées"
          value={
            rentedResult.count ??
            0
          }
        />
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <a
          href={`/${locale}/pocket/prospects`}
          className="rounded-[22px] border border-ink/10 bg-paper p-4"
        >
          <Users className="h-5 w-5 text-green-700" />

          <p className="mt-3 text-2xl font-semibold text-ink">
            {prospectsCountResult.count ??
              0}
          </p>

          <p className="mt-1 text-xs text-ink-soft">
            Prospects
          </p>
        </a>

        <a
          href={`/${locale}/pocket/prospects`}
          className="rounded-[22px] border border-ink/10 bg-paper p-4"
        >
          <CalendarDays className="h-5 w-5 text-green-700" />

          <p className="mt-3 text-2xl font-semibold text-ink">
            {scheduledResult.count ??
              0}
          </p>

          <p className="mt-1 text-xs text-ink-soft">
            Visites prévues
          </p>
        </a>
      </section>

      {telegramFailed > 0 ? (
        <div className="mt-5 flex items-start gap-3 rounded-[22px] border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Telegram
            </p>

            <p className="mt-1 text-xs leading-5 text-red-700">
              {telegramFailed} publication
              {telegramFailed > 1
                ? "s ont"
                : " a"} échoué.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-3 rounded-[22px] border border-green-700/10 bg-green-100/60 p-4">
          <Send className="h-5 w-5 text-green-700" />

          <div>
            <p className="text-sm font-semibold text-green-900">
              Telegram opérationnel
            </p>

            <p className="mt-0.5 text-xs text-green-800">
              Aucune publication en erreur.
            </p>
          </div>
        </div>
      )}

      <section className="mt-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-700">
              Logements
            </p>

            <h2 className="mt-1 font-display text-2xl text-ink">
              Dernières annonces
            </h2>
          </div>

          <a
            href={`/${locale}/pocket/annonces`}
            className="flex items-center gap-1 text-xs font-semibold text-green-700"
          >
            Tout voir
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-4 space-y-3">
          {listings.length === 0 ? (
            <div className="rounded-[22px] border border-ink/10 bg-paper p-5 text-sm text-ink-soft">
              Aucune annonce.
            </div>
          ) : (
            listings.map(
              (listing) => (
                <a
                  key={listing.id}
                  href={`/${locale}/admin/annonces/${listing.id}`}
                  className="block rounded-[22px] border border-ink/10 bg-paper p-4 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold text-green-700">
                          {listing.reference ??
                            "Sans référence"}
                        </p>

                        <span
                          className={`rounded-full px-2 py-1 text-[9px] font-semibold ${statusClass(
                            listing.status
                          )}`}
                        >
                          {statusLabel(
                            listing.status
                          )}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm font-semibold text-ink">
                        {listing.title_fr ??
                          listing.district}
                      </p>

                      <p className="mt-1 text-xs text-ink-soft">
                        {listing.district}
                      </p>
                    </div>

                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink/30" />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-green-800">
                    {formatPrice(
                      listing.monthly_price,
                      listing.yearly_price
                    )}
                  </p>
                </a>
              )
            )
          )}
        </div>
      </section>

      {prospects.length > 0 && (
        <section className="mt-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-700">
                Clients
              </p>

              <h2 className="mt-1 font-display text-2xl text-ink">
                Derniers prospects
              </h2>
            </div>

            <a
              href={`/${locale}/pocket/prospects`}
              className="text-xs font-semibold text-green-700"
            >
              Voir
            </a>
          </div>

          <div className="mt-4 overflow-hidden rounded-[22px] border border-ink/10 bg-paper">
            {prospects.map(
              (
                prospect,
                index
              ) => (
                <div
                  key={prospect.id}
                  className={`flex items-center justify-between gap-4 px-4 py-4 ${
                    index !==
                    prospects.length - 1
                      ? "border-b border-ink/5"
                      : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {prospect.name}
                    </p>

                    <p className="mt-1 text-[11px] text-ink-soft">
                      {prospectStatus(
                        prospect.status
                      )}
                    </p>
                  </div>

                  <a
                    href={`tel:${prospect.phone}`}
                    className="rounded-full bg-green-100 px-3 py-2 text-[11px] font-semibold text-green-800"
                  >
                    Appeler
                  </a>
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[22px] border border-ink/10 bg-paper p-4">
      <Icon className="h-5 w-5 text-green-700" />

      <p className="mt-3 text-2xl font-semibold text-ink">
        {value}
      </p>

      <p className="mt-1 text-xs text-ink-soft">
        {label}
      </p>
    </div>
  );
}
