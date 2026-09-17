"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Check,
  Clock3,
  ExternalLink,
  Search,
  WalletCards,
  X,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/client";

export type CommissionStatus =
  | "pending"
  | "paid"
  | "cancelled";

export type CommissionItem = {
  listing_id: string;

  listing_reference: string | null;
  listing_title: string | null;
  district: string | null;

  owner_name: string | null;
  owner_phone: string | null;
  owner_whatsapp: string | null;

  commission_type: string | null;
  commission_value: number | null;
  commission_status: CommissionStatus | null;

  prospect_id: string | null;
  prospect_reference: string | null;
  prospect_name: string | null;
  prospect_phone: string | null;

  rented_at: string | null;
};

type FilterValue =
  | "all"
  | CommissionStatus;

export default function CommissionsManager({
  initialCommissions,
}: {
  initialCommissions: CommissionItem[];
}) {
  const [
    commissions,
    setCommissions,
  ] =
    useState<CommissionItem[]>(
      initialCommissions
    );

  const [
    filter,
    setFilter,
  ] =
    useState<FilterValue>(
      "all"
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    loadingId,
    setLoadingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    message,
    setMessage,
  ] =
    useState("");

  const normalizedCommissions =
    useMemo(() => {
      return commissions.map(
        (
          commission
        ) => ({
          ...commission,

          commission_status:
            commission.commission_status ??
            "pending",
        })
      );
    }, [
      commissions,
    ]);

  const stats =
    useMemo(() => {
      const pending =
        normalizedCommissions.filter(
          (
            item
          ) =>
            item.commission_status ===
            "pending"
        );

      const paid =
        normalizedCommissions.filter(
          (
            item
          ) =>
            item.commission_status ===
            "paid"
        );

      return {
        pendingCount:
          pending.length,

        paidCount:
          paid.length,

        pendingAmount:
          pending.reduce(
            (
              total,
              item
            ) =>
              total +
              getCommissionAmount(
                item
              ),
            0
          ),

        paidAmount:
          paid.reduce(
            (
              total,
              item
            ) =>
              total +
              getCommissionAmount(
                item
              ),
            0
          ),
      };
    }, [
      normalizedCommissions,
    ]);

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return normalizedCommissions.filter(
        (
          item
        ) => {
          if (
            filter !==
              "all" &&
            item.commission_status !==
              filter
          ) {
            return false;
          }

          if (
            !query
          ) {
            return true;
          }

          const haystack = [
            item.listing_reference ??
              "",
            item.listing_title ??
              "",
            item.district ??
              "",
            item.owner_name ??
              "",
            item.owner_phone ??
              "",
            item.owner_whatsapp ??
              "",
            item.prospect_reference ??
              "",
            item.prospect_name ??
              "",
            item.prospect_phone ??
              "",
          ]
            .join(
              " "
            )
            .toLowerCase();

          return haystack.includes(
            query
          );
        }
      );
    }, [
      normalizedCommissions,
      filter,
      search,
    ]);

  async function changeStatus(
    listingId: string,
    status:
      CommissionStatus
  ) {
    setLoadingId(
      listingId
    );

    setMessage("");

    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase
        .from(
          "listing_private"
        )
        .update({
          commission_status:
            status,
        })
        .eq(
          "listing_id",
          listingId
        );

    if (
      error
    ) {
      setMessage(
        error.message
      );

      setLoadingId(
        null
      );

      return;
    }

    setCommissions(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.listing_id ===
            listingId
              ? {
                  ...item,
                  commission_status:
                    status,
                }
              : item
        )
    );

    setLoadingId(
      null
    );
  }

  return (
    <div>

      {/* HEADER */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-xs font-medium uppercase tracking-[0.16em] text-green-700">
            Mathwa
          </p>

          <h1 className="mt-2 font-display text-4xl font-light text-ink">
            Commissions
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Suis les commissions liées aux locations conclues et ce qu&apos;il reste à encaisser.
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          icon={
            Clock3
          }
          label="À recevoir"
          value={
            formatMoney(
              stats.pendingAmount
            )
          }
          sub={`${stats.pendingCount} commission${
            stats.pendingCount >
            1
              ? "s"
              : ""
          }`}
        />

        <StatCard
          icon={
            Check
          }
          label="Encaissées"
          value={
            formatMoney(
              stats.paidAmount
            )
          }
          sub={`${stats.paidCount} payée${
            stats.paidCount >
            1
              ? "s"
              : ""
          }`}
        />

        <StatCard
          icon={
            WalletCards
          }
          label="Total potentiel"
          value={
            formatMoney(
              stats.pendingAmount +
                stats.paidAmount
            )
          }
          sub="Commissions actives"
        />

        <StatCard
          icon={
            WalletCards
          }
          label="Locations"
          value={String(
            normalizedCommissions.filter(
              (
                item
              ) =>
                item.prospect_id
            ).length
          )}
          sub="Avec prospect loué"
        />

      </div>

      {/* FILTRES */}

      <div className="mt-8 rounded-3xl border border-ink/10 bg-paper p-4 sm:p-5">

        <div className="relative">

          <Search
            className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
            aria-hidden="true"
          />

          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Rechercher une annonce, un propriétaire ou un locataire..."
            className="w-full rounded-2xl border border-ink/10 bg-sand/40 py-3.5 pe-4 ps-11 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-green-700"
          />

        </div>

        <div className="mt-4 flex flex-wrap gap-2">

          <FilterButton
            active={
              filter ===
              "all"
            }
            onClick={() =>
              setFilter(
                "all"
              )
            }
          >
            Toutes
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "pending"
            }
            onClick={() =>
              setFilter(
                "pending"
              )
            }
          >
            À recevoir
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "paid"
            }
            onClick={() =>
              setFilter(
                "paid"
              )
            }
          >
            Payées
          </FilterButton>

          <FilterButton
            active={
              filter ===
              "cancelled"
            }
            onClick={() =>
              setFilter(
                "cancelled"
              )
            }
          >
            Annulées
          </FilterButton>

        </div>

      </div>

      {message && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {
            message
          }
        </div>
      )}

      {/* TABLEAU */}

      <div className="mt-6 overflow-hidden rounded-3xl border border-ink/10 bg-paper">

        {filtered.length ===
        0 ? (

          <div className="px-6 py-20 text-center">

            <WalletCards className="mx-auto h-8 w-8 text-ink/20" />

            <h2 className="mt-5 font-display text-2xl font-normal text-ink">
              Aucune commission
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              Rien ne correspond à ce filtre pour le moment.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1250px]">

              <thead className="border-b border-ink/10 bg-sand/50">

                <tr className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-soft">

                  <th className="px-5 py-4 text-start">
                    Annonce
                  </th>

                  <th className="px-5 py-4 text-start">
                    Propriétaire
                  </th>

                  <th className="px-5 py-4 text-start">
                    Locataire
                  </th>

                  <th className="px-5 py-4 text-start">
                    Commission
                  </th>

                  <th className="px-5 py-4 text-start">
                    Payeur
                  </th>

                  <th className="px-5 py-4 text-start">
                    Statut
                  </th>

                  <th className="px-5 py-4 text-end">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-ink/8">

                {filtered.map(
                  (
                    item
                  ) => {

                    const amount =
                      getCommissionAmount(
                        item
                      );

                    const status =
                      item.commission_status ??
                      "pending";

                    return (
                      <tr
                        key={
                          item.listing_id
                        }
                        className="transition hover:bg-sand/30"
                      >

                        {/* ANNONCE */}

                        <td className="px-5 py-5">

                          <p className="text-sm font-semibold text-ink">
                            {
                              item.listing_reference ??
                              "Sans référence"
                            }
                          </p>

                          {item.district && (
                            <p className="mt-1 text-xs font-medium text-green-700">
                              {
                                item.district
                              }
                            </p>
                          )}

                          {item.listing_title && (
                            <p className="mt-1 max-w-[230px] truncate text-xs text-ink-soft">
                              {
                                item.listing_title
                              }
                            </p>
                          )}

                        </td>

                        {/* PROPRIO */}

                        <td className="px-5 py-5">

                          <p className="text-sm font-medium text-ink">
                            {
                              item.owner_name ||
                              "Non renseigné"
                            }
                          </p>

                          {(item.owner_whatsapp ||
                            item.owner_phone) && (
                            <a
                              href={`https://wa.me/${cleanPhone(
                                item.owner_whatsapp ||
                                  item.owner_phone ||
                                  ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs text-green-700"
                            >
                              WhatsApp
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}

                        </td>

                        {/* LOCATAIRE */}

                        <td className="px-5 py-5">

                          {item.prospect_name ? (
                            <>

                              <p className="text-sm font-medium text-ink">
                                {
                                  item.prospect_name
                                }
                              </p>

                              <p className="mt-1 text-xs text-ink-soft">
                                {
                                  item.prospect_reference
                                }
                              </p>

                              {item.prospect_phone && (
                                <a
                                  href={`https://wa.me/${cleanPhone(
                                    item.prospect_phone
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-xs text-green-700"
                                >
                                  WhatsApp
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}

                            </>
                          ) : (

                            <span className="text-sm text-ink/35">
                              Aucun locataire lié
                            </span>

                          )}

                        </td>

                        {/* MONTANT */}

                        <td className="px-5 py-5">

                          <p className="font-display text-2xl font-medium text-green-700">
                            {
                              formatMoney(
                                amount
                              )
                            }
                          </p>

                          <p className="mt-1 text-xs text-ink-soft">
                            {
                              formatCommissionType(
                                item.commission_type
                              )
                            }
                          </p>

                        </td>

                        {/* PAYEUR */}

                        <td className="px-5 py-5">

                          <span className="rounded-full bg-sand px-3 py-2 text-xs font-medium text-ink">
                            Locataire
                          </span>

                        </td>

                        {/* STATUT */}

                        <td className="px-5 py-5">

                          <StatusBadge
                            status={
                              status
                            }
                          />

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-5">

                          <div className="flex justify-end gap-2">

                            {status !==
                              "paid" && (

                              <button
                                type="button"
                                disabled={
                                  loadingId ===
                                  item.listing_id
                                }
                                onClick={() =>
                                  changeStatus(
                                    item.listing_id,
                                    "paid"
                                  )
                                }
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-green-700 px-4 py-2 text-xs font-semibold text-paper transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Check className="h-3.5 w-3.5" />

                                {loadingId ===
                                item.listing_id
                                  ? "..."
                                  : "Marquer payée"}
                              </button>

                            )}

                            {status ===
                              "paid" && (

                              <button
                                type="button"
                                disabled={
                                  loadingId ===
                                  item.listing_id
                                }
                                onClick={() =>
                                  changeStatus(
                                    item.listing_id,
                                    "pending"
                                  )
                                }
                                className="cursor-pointer rounded-full border border-ink/10 bg-paper px-4 py-2 text-xs font-medium text-ink"
                              >
                                Remettre à recevoir
                              </button>

                            )}

                            {status !==
                              "cancelled" && (

                              <button
                                type="button"
                                disabled={
                                  loadingId ===
                                  item.listing_id
                                }
                                onClick={() =>
                                  changeStatus(
                                    item.listing_id,
                                    "cancelled"
                                  )
                                }
                                title="Annuler"
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon:
    typeof WalletCards;

  label:
    string;

  value:
    string;

  sub:
    string;
}) {
  return (
    <div className="rounded-3xl border border-ink/10 bg-paper p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-green-800">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-5 text-xs text-ink-soft">
        {
          label
        }
      </p>

      <p className="mt-1 font-display text-3xl font-medium text-ink">
        {
          value
        }
      </p>

      <p className="mt-1 text-xs text-ink-soft">
        {
          sub
        }
      </p>

    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active:
    boolean;

  onClick:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-full px-4 py-2 text-xs font-medium transition ${
        active
          ? "bg-green-700 text-paper"
          : "border border-ink/10 bg-paper text-ink hover:bg-sand"
      }`}
    >
      {
        children
      }
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status:
    CommissionStatus;
}) {
  if (
    status ===
    "paid"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-2 text-xs font-semibold text-green-800">

        <Check className="h-3.5 w-3.5" />

        Payée

      </span>
    );
  }

  if (
    status ===
    "cancelled"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">

        <X className="h-3.5 w-3.5" />

        Annulée

      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">

      <Clock3 className="h-3.5 w-3.5" />

      À recevoir

    </span>
  );
}

function getCommissionAmount(
  item:
    CommissionItem
) {
  if (
    item.commission_value ===
      null ||
    item.commission_value ===
      undefined
  ) {
    return 0;
  }

  return Number(
    item.commission_value
  );
}

function formatMoney(
  value:
    number
) {
  return `${"\u20C1"} ${Number(
    value
  ).toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits:
        2,
    }
  )}`;
}

function formatCommissionType(
  type:
    string | null
) {
  if (!type) {
    return "Commission";
  }

  if (
    type ===
    "fixed"
  ) {
    return "Montant fixe";
  }

  if (
    type ===
    "percentage"
  ) {
    return "Pourcentage";
  }

  return type;
}

function cleanPhone(
  phone:
    string
) {
  let digits =
    phone.replace(
      /\D/g,
      ""
    );

  if (
    digits.startsWith(
      "00"
    )
  ) {
    digits =
      digits.slice(
        2
      );
  }

  if (
    digits.startsWith(
      "05"
    ) &&
    digits.length ===
      10
  ) {
    return `966${digits.slice(
      1
    )}`;
  }

  if (
    digits.startsWith(
      "5"
    ) &&
    digits.length ===
      9
  ) {
    return `966${digits}`;
  }

  return digits;
}