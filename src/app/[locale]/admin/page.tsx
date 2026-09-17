import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import Header from "@/components/Header";
import AdminListingSearch from "@/components/admin/AdminListingSearch";

import { createClient } from "@/lib/supabase/server";

export default async function AdminPage({
  params,
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const { locale } =
    await params;

  setRequestLocale(
    locale
  );

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/${locale}/admin/login`
    );
  }

  /*
   * =========================================
   * CHARGEMENT DASHBOARD
   * =========================================
   */

  const [
    listingsResult,
    prospectsResult,
    commissionsResult,
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
          bedrooms,
          bathrooms,
          furnished,
          verified,
          created_at
        `)
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        ),

      supabase
        .from("prospects")
        .select(`
          id,
          status,
          visit_at,
          created_at
        `),

      supabase
        .from(
          "listing_private"
        )
        .select(`
          listing_id,
          commission_type,
          commission_value,
          commission_status
        `),
    ]);

  const listings =
    listingsResult.data ??
    [];

  const prospects =
    prospectsResult.data ??
    [];

  const commissions =
    commissionsResult.data ??
    [];

  const error =
    listingsResult.error ||
    prospectsResult.error ||
    commissionsResult.error;

  /*
   * =========================================
   * STATS ANNONCES
   * =========================================
   */

  const total =
    listings.length;

  const published =
    listings.filter(
      (
        listing
      ) =>
        listing.status ===
        "published"
    ).length;

  const rented =
    listings.filter(
      (
        listing
      ) =>
        listing.status ===
        "rented"
    ).length;

  /*
   * =========================================
   * STATS PROSPECTS
   * =========================================
   */

  const scheduledVisits =
    prospects.filter(
      (
        prospect
      ) =>
        prospect.status ===
        "visit_scheduled"
    ).length;

  /*
   * =========================================
   * STATS COMMISSIONS
   * =========================================
   */

  const activeCommissions =
    commissions.filter(
      (
        commission
      ) =>
        commission.commission_value !==
          null ||
        commission.commission_type !==
          null
    );

  const pendingCommissions =
    activeCommissions.filter(
      (
        commission
      ) =>
        !commission.commission_status ||
        commission.commission_status ===
          "pending"
    );

  const paidCommissions =
    activeCommissions.filter(
      (
        commission
      ) =>
        commission.commission_status ===
        "paid"
    );

  const pendingCommissionAmount =
    pendingCommissions.reduce(
      (
        total,
        commission
      ) =>
        total +
        Number(
          commission.commission_value ??
            0
        ),
      0
    );

  const paidCommissionAmount =
    paidCommissions.reduce(
      (
        total,
        commission
      ) =>
        total +
        Number(
          commission.commission_value ??
            0
        ),
      0
    );

  return (
    <>
      <Header />

      <main className="min-h-screen bg-sand px-5 pb-24 pt-28 sm:px-8 sm:pt-32">

        <div className="mx-auto max-w-6xl">

          {/* =========================================
              HEADER
          ========================================= */}

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-sm font-medium uppercase tracking-[0.16em] text-green-700">
                Administration
              </p>

              <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-light leading-tight text-ink">
                Tableau de bord
              </h1>

              <p className="mt-2 text-sm text-ink-soft">
                {user.email}
              </p>

            </div>

            {/* ACTIONS PRINCIPALES */}

            <div className="flex flex-wrap gap-2">

              <a
                href={`/${locale}/admin/prospects`}
                className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-paper px-5 py-3 text-sm font-medium text-ink transition hover:border-green-700/30 hover:bg-green-100"
              >
                Prospects & visites
              </a>

              <a
                href={`/${locale}/admin/commissions`}
                className="inline-flex items-center justify-center rounded-full border border-green-700/20 bg-green-100 px-5 py-3 text-sm font-medium text-green-800 transition hover:bg-green-700 hover:text-paper"
              >
                Commissions
              </a>

              <a
                href={`/${locale}/admin/annonces/nouvelle`}
                className="inline-flex items-center justify-center rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-paper transition hover:bg-green-800"
              >
                + Ajouter un appartement
              </a>

            </div>

          </div>

          {/* =========================================
              RECHERCHE RAPIDE
          ========================================= */}

          <section className="relative z-50 mt-8">

            <div className="mb-3 flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
                  Recherche rapide
                </p>

                <p className="mt-1 text-sm text-ink-soft">
                  Retrouve directement une annonce par référence, quartier, titre ou prix.
                </p>

              </div>

            </div>

            <AdminListingSearch />

          </section>

          {/* =========================================
              ERREUR
          ========================================= */}

          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">

              ERREUR SUPABASE :{" "}

              {
                error.message
              }

            </div>
          )}

          {/* =========================================
              STATS
          ========================================= */}

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* TOTAL */}

            <div className="rounded-3xl border border-ink/10 bg-paper p-6">

              <p className="text-sm text-ink-soft">
                Total annonces
              </p>

              <p className="mt-2 font-display text-4xl font-light text-ink">
                {
                  total
                }
              </p>

              <p className="mt-2 text-xs text-ink-soft">
                Tous statuts confondus
              </p>

            </div>

            {/* PUBLIÉES */}

            <div className="rounded-3xl border border-ink/10 bg-paper p-6">

              <p className="text-sm text-ink-soft">
                Publiées
              </p>

              <p className="mt-2 font-display text-4xl font-light text-green-700">
                {
                  published
                }
              </p>

              <p className="mt-2 text-xs text-ink-soft">
                Visibles actuellement
              </p>

            </div>

            {/* LOUÉES */}

            <div className="rounded-3xl border border-ink/10 bg-paper p-6">

              <p className="text-sm text-ink-soft">
                Locations conclues
              </p>

              <p className="mt-2 font-display text-4xl font-light text-ink">
                {
                  rented
                }
              </p>

              <a
                href={`/${locale}/admin/prospects`}
                className="mt-2 inline-block text-xs font-medium text-green-700"
              >
                Voir les prospects →
              </a>

            </div>

            {/* VISITES */}

            <a
              href={`/${locale}/admin/prospects`}
              className="group rounded-3xl border border-ink/10 bg-paper p-6 transition hover:-translate-y-0.5 hover:border-green-700/20 hover:shadow-[0_10px_35px_rgba(18,33,28,0.06)]"
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-sm text-ink-soft">
                    Visites prévues
                  </p>

                  <p className="mt-2 font-display text-4xl font-light text-ink">
                    {
                      scheduledVisits
                    }
                  </p>

                </div>

                <span className="rounded-full bg-sand px-3 py-1 text-xs text-green-700 transition group-hover:bg-green-100">
                  Gérer
                </span>

              </div>

              <p className="mt-2 text-xs text-ink-soft">
                Rendez-vous à venir
              </p>

            </a>

            {/* COMMISSIONS À RECEVOIR */}

            <a
              href={`/${locale}/admin/commissions`}
              className="group rounded-3xl border border-gold/30 bg-paper p-6 transition hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(18,33,28,0.06)]"
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-sm text-ink-soft">
                    Commissions à recevoir
                  </p>

                  <p className="mt-2 font-display text-4xl font-light text-green-800">

                    <span aria-hidden="true">
                      {"\u20C1"}
                    </span>{" "}

                    {pendingCommissionAmount.toLocaleString(
                      "fr-FR",
                      {
                        maximumFractionDigits:
                          2,
                      }
                    )}

                  </p>

                </div>

                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-ink">
                  {
                    pendingCommissions.length
                  }
                </span>

              </div>

              <p className="mt-2 text-xs text-ink-soft">
                À encaisser
              </p>

            </a>

            {/* COMMISSIONS ENCAISSÉES */}

            <a
              href={`/${locale}/admin/commissions`}
              className="group rounded-3xl border border-green-700/15 bg-green-100/40 p-6 transition hover:-translate-y-0.5 hover:border-green-700/30 hover:shadow-[0_10px_35px_rgba(18,33,28,0.06)]"
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-sm text-ink-soft">
                    Commissions encaissées
                  </p>

                  <p className="mt-2 font-display text-4xl font-light text-green-800">

                    <span aria-hidden="true">
                      {"\u20C1"}
                    </span>{" "}

                    {paidCommissionAmount.toLocaleString(
                      "fr-FR",
                      {
                        maximumFractionDigits:
                          2,
                      }
                    )}

                  </p>

                </div>

                <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-medium text-paper">
                  {
                    paidCommissions.length
                  }
                </span>

              </div>

              <p className="mt-2 text-xs text-ink-soft">
                Déjà reçues
              </p>

            </a>

          </div>

          {/* =========================================
              RACCOURCIS GESTION
          ========================================= */}

          <section className="mt-12">

            <div>

              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
                Gestion
              </p>

              <h2 className="mt-2 font-display text-3xl font-light text-ink">
                Accès rapides
              </h2>

            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              {/* PROSPECTS */}

              <a
                href={`/${locale}/admin/prospects`}
                className="group rounded-3xl border border-ink/10 bg-paper p-6 transition hover:border-green-700/30 hover:shadow-[0_10px_35px_rgba(18,33,28,0.06)]"
              >

                <div className="flex items-start justify-between gap-6">

                  <div>

                    <p className="font-display text-2xl text-ink">
                      Prospects & visites
                    </p>

                    <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">
                      Gère les demandes, les rendez-vous, les codes visite et les locations conclues.
                    </p>

                  </div>

                  <span className="text-xl text-green-700 transition-transform group-hover:translate-x-1">
                    →
                  </span>

                </div>

                <div className="mt-6 flex gap-4 border-t border-ink/8 pt-5">

                  <div>

                    <p className="text-xs text-ink-soft">
                      Prospects
                    </p>

                    <p className="mt-1 font-display text-2xl text-ink">
                      {
                        prospects.length
                      }
                    </p>

                  </div>

                  <div className="h-10 w-px bg-ink/10" />

                  <div>

                    <p className="text-xs text-ink-soft">
                      Visites prévues
                    </p>

                    <p className="mt-1 font-display text-2xl text-green-700">
                      {
                        scheduledVisits
                      }
                    </p>

                  </div>

                </div>

              </a>

              {/* COMMISSIONS */}

              <a
                href={`/${locale}/admin/commissions`}
                className="group rounded-3xl border border-ink/10 bg-paper p-6 transition hover:border-green-700/30 hover:shadow-[0_10px_35px_rgba(18,33,28,0.06)]"
              >

                <div className="flex items-start justify-between gap-6">

                  <div>

                    <p className="font-display text-2xl text-ink">
                      Commissions
                    </p>

                    <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">
                      Consulte ce qui reste à encaisser et marque les commissions comme payées.
                    </p>

                  </div>

                  <span className="text-xl text-green-700 transition-transform group-hover:translate-x-1">
                    →
                  </span>

                </div>

                <div className="mt-6 flex gap-4 border-t border-ink/8 pt-5">

                  <div>

                    <p className="text-xs text-ink-soft">
                      À recevoir
                    </p>

                    <p className="mt-1 font-display text-2xl text-green-700">

                      {"\u20C1"}{" "}

                      {pendingCommissionAmount.toLocaleString(
                        "fr-FR"
                      )}

                    </p>

                  </div>

                  <div className="h-10 w-px bg-ink/10" />

                  <div>

                    <p className="text-xs text-ink-soft">
                      Encaissées
                    </p>

                    <p className="mt-1 font-display text-2xl text-ink">

                      {"\u20C1"}{" "}

                      {paidCommissionAmount.toLocaleString(
                        "fr-FR"
                      )}

                    </p>

                  </div>

                </div>

              </a>

            </div>

          </section>

          {/* =========================================
              ANNONCES
          ========================================= */}

          <section className="mt-12">

            <div className="flex items-center justify-between gap-4">

              <h2 className="font-display text-3xl font-light text-ink">
                Appartements
              </h2>

              <span className="text-sm text-ink-soft">

                {
                  total
                }{" "}

                annonce

                {total > 1
                  ? "s"
                  : ""}

              </span>

            </div>

            {listings.length >
            0 ? (

              <div className="mt-6 space-y-4">

                {listings.map(
                  (
                    listing
                  ) => (

                    <article
                      key={
                        listing.id
                      }
                      className="rounded-3xl border border-ink/10 bg-paper p-6 transition hover:border-green-700/20 hover:shadow-[0_8px_30px_rgba(18,33,28,0.05)]"
                    >

                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                        {/* INFOS */}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="text-xs font-semibold uppercase tracking-wider text-green-700">
                              {
                                listing.reference
                              }
                            </span>

                            <span
                              className={
                                listing.status ===
                                "published"
                                  ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                                  : listing.status ===
                                      "rented"
                                    ? "rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-ink"
                                    : listing.status ===
                                        "archived"
                                      ? "rounded-full bg-ink/10 px-3 py-1 text-xs font-medium text-ink-soft"
                                      : "rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink-soft"
                              }
                            >

                              {listing.status ===
                              "published"
                                ? "Publiée"
                                : listing.status ===
                                    "rented"
                                  ? "Louée"
                                  : listing.status ===
                                      "archived"
                                    ? "Archivée"
                                    : "Brouillon"}

                            </span>

                            {listing.verified && (

                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                Vérifiée
                              </span>

                            )}

                          </div>

                          <h3 className="mt-4 font-display text-2xl font-normal text-ink">

                            {listing.title_fr ||
                              "Sans titre"}

                          </h3>

                          <p className="mt-1 text-sm font-medium text-green-700">
                            {
                              listing.district
                            }
                          </p>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">

                            <span>

                              {
                                listing.bedrooms
                              }{" "}

                              chambre

                              {listing.bedrooms >
                              1
                                ? "s"
                                : ""}

                            </span>

                            <span>

                              {
                                listing.bathrooms
                              }{" "}

                              salle

                              {listing.bathrooms >
                              1
                                ? "s"
                                : ""}{" "}

                              de bain

                            </span>

                            <span>

                              {listing.furnished
                                ? "Meublé"
                                : "Non meublé"}

                            </span>

                          </div>

                          {/* PRIX */}

                          <div className="mt-4">

                            {listing.monthly_price && (

                              <span className="font-display text-2xl text-green-800">

                                {"\u20C1"}{" "}

                                {Number(
                                  listing.monthly_price
                                ).toLocaleString(
                                  "fr-FR"
                                )}

                                <span className="ml-1 font-sans text-sm font-normal text-ink-soft">
                                  / mois
                                </span>

                              </span>

                            )}

                            {!listing.monthly_price &&
                              listing.yearly_price && (

                                <span className="font-display text-2xl text-green-800">

                                  {"\u20C1"}{" "}

                                  {Number(
                                    listing.yearly_price
                                  ).toLocaleString(
                                    "fr-FR"
                                  )}

                                  <span className="ml-1 font-sans text-sm font-normal text-ink-soft">
                                    / an
                                  </span>

                                </span>

                              )}

                          </div>

                        </div>

                        {/* ACTIONS */}

                        <div className="flex shrink-0 flex-wrap gap-2">

                          {listing.status ===
                            "published" && (

                            <a
                              href={`/${locale}/annonces/${listing.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full border border-green-700/20 bg-green-100 px-5 py-2.5 text-sm font-medium text-green-800 transition hover:bg-green-700 hover:text-paper"
                            >
                              Voir
                            </a>

                          )}

                          <a
                            href={`/${locale}/admin/annonces/${listing.id}`}
                            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink transition hover:border-green-700 hover:bg-sand"
                          >
                            Modifier
                          </a>

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            ) : (

              <div className="mt-6 rounded-3xl border border-ink/10 bg-paper p-8">

                <p className="text-sm text-ink-soft">
                  Aucune annonce trouvée.
                </p>

              </div>

            )}

          </section>

        </div>

      </main>
    </>
  );
}