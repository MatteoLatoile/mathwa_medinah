"use client";

import {
  FormEvent,
  ReactNode,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

export type ProspectStatus =
  | "new"
  | "contacted"
  | "visit_scheduled"
  | "visited"
  | "rented"
  | "lost";

export type Prospect = {
  id: string;
  reference: string;
  listing_id: string | null;
  name: string;
  phone: string;
  status: ProspectStatus;
  visit_at: string | null;
  visit_code: string | null;
  notes: string | null;
  created_at: string;
};

export type ProspectListing = {
  id: string;
  reference: string | null;
  district: string;
  title_fr: string | null;
  status: string;

  owner_name?: string | null;
  owner_phone?: string | null;
  owner_whatsapp?: string | null;
};

type FilterStatus =
  | "all"
  | ProspectStatus;

const STATUS_OPTIONS: {
  value: ProspectStatus;
  label: string;
}[] = [
  {
    value: "new",
    label: "Nouveau",
  },
  {
    value: "contacted",
    label: "Contacté",
  },
  {
    value: "visit_scheduled",
    label: "Visite prévue",
  },
  {
    value: "visited",
    label: "Visité",
  },
  {
    value: "rented",
    label: "Loué",
  },
  {
    value: "lost",
    label: "Perdu",
  },
];

export default function ProspectsManager({
  initialProspects,
  listings,
}: {
  initialProspects: Prospect[];
  listings: ProspectListing[];
}) {
  const [
    prospects,
    setProspects,
  ] =
    useState<Prospect[]>(
      initialProspects
    );

  const [
    filter,
    setFilter,
  ] =
    useState<FilterStatus>(
      "all"
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    addOpen,
    setAddOpen,
  ] =
    useState(false);

  const [
    visitProspect,
    setVisitProspect,
  ] =
    useState<Prospect | null>(
      null
    );

  const [
    visitDate,
    setVisitDate,
  ] =
    useState("");

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    listingId,
    setListingId,
  ] =
    useState("");

  const [
    notes,
    setNotes,
  ] =
    useState("");

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const listingMap =
    useMemo(() => {
      return new Map(
        listings.map(
          (
            listing
          ) => [
            listing.id,
            listing,
          ]
        )
      );
    }, [
      listings,
    ]);

  const filteredProspects =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return prospects.filter(
        (
          prospect
        ) => {
          if (
            filter !==
              "all" &&
            prospect.status !==
              filter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const listing =
            prospect.listing_id
              ? listingMap.get(
                  prospect.listing_id
                )
              : null;

          const haystack = [
            prospect.reference,
            prospect.name,
            prospect.phone,
            prospect.visit_code ??
              "",
            listing?.reference ??
              "",
            listing?.district ??
              "",
            listing?.title_fr ??
              "",
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            query
          );
        }
      );
    }, [
      prospects,
      filter,
      search,
      listingMap,
    ]);

  const stats =
    useMemo(() => {
      return {
        total:
          prospects.length,

        scheduled:
          prospects.filter(
            (
              prospect
            ) =>
              prospect.status ===
              "visit_scheduled"
          ).length,

        visited:
          prospects.filter(
            (
              prospect
            ) =>
              prospect.status ===
              "visited"
          ).length,

        rented:
          prospects.filter(
            (
              prospect
            ) =>
              prospect.status ===
              "rented"
          ).length,
      };
    }, [
      prospects,
    ]);

  async function addProspect(
    event: FormEvent
  ) {
    event.preventDefault();

    if (
      !name.trim() ||
      !phone.trim()
    ) {
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "prospects"
        )
        .insert({
          name:
            name.trim(),

          phone:
            phone.trim(),

          listing_id:
            listingId ||
            null,

          notes:
            notes.trim() ||
            null,

          status:
            "new",
        })
        .select(`
          id,
          reference,
          listing_id,
          name,
          phone,
          status,
          visit_at,
          visit_code,
          notes,
          created_at
        `)
        .single();

    if (
      error ||
      !data
    ) {
      setMessage(
        error?.message ??
          "Impossible d'ajouter le prospect."
      );

      setSaving(false);

      return;
    }

    setProspects(
      (
        current
      ) => [
        data as Prospect,
        ...current,
      ]
    );

    setName("");
    setPhone("");
    setListingId("");
    setNotes("");
    setAddOpen(false);
    setSaving(false);
  }

  async function updateStatus(
    prospect:
      Prospect,
    status:
      ProspectStatus
  ) {
    setMessage("");

    const supabase =
      createClient();

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "prospects"
        )
        .update({
          status,
        })
        .eq(
          "id",
          prospect.id
        )
        .select(`
          id,
          reference,
          listing_id,
          name,
          phone,
          status,
          visit_at,
          visit_code,
          notes,
          created_at
        `)
        .single();

    if (
      error ||
      !data
    ) {
      setMessage(
        error?.message ??
          "Impossible de modifier le statut."
      );

      return;
    }

    setProspects(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.id ===
            prospect.id
              ? data as Prospect
              : item
        )
    );

    /*
     * Si la location est conclue,
     * l'annonce passe également en "rented"
     * et disparaît du public.
     */
    if (
      status ===
        "rented" &&
      prospect.listing_id
    ) {
      const {
        error:
          listingError,
      } =
        await supabase
          .from(
            "listings"
          )
          .update({
            status:
              "rented",
          })
          .eq(
            "id",
            prospect.listing_id
          );

      if (
        listingError
      ) {
        setMessage(
          `Prospect mis à jour, mais erreur sur l'annonce : ${listingError.message}`
        );
      }
    }
  }

  function openVisitModal(
    prospect:
      Prospect
  ) {
    setVisitProspect(
      prospect
    );

    setVisitDate(
      prospect.visit_at
        ? toDatetimeLocal(
            prospect.visit_at
          )
        : ""
    );

    setMessage("");
  }

  async function scheduleVisit(
    event:
      FormEvent
  ) {
    event.preventDefault();

    if (
      !visitProspect ||
      !visitDate
    ) {
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase =
      createClient();

    const visitCode =
      visitProspect.visit_code ||
      createNextVisitCode(
        prospects
      );

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "prospects"
        )
        .update({
          visit_at:
            new Date(
              visitDate
            ).toISOString(),

          visit_code:
            visitCode,

          status:
            "visit_scheduled",
        })
        .eq(
          "id",
          visitProspect.id
        )
        .select(`
          id,
          reference,
          listing_id,
          name,
          phone,
          status,
          visit_at,
          visit_code,
          notes,
          created_at
        `)
        .single();

    if (
      error ||
      !data
    ) {
      setMessage(
        error?.message ??
          "Impossible de planifier la visite."
      );

      setSaving(false);

      return;
    }

    setProspects(
      (
        current
      ) =>
        current.map(
          (
            item
          ) =>
            item.id ===
            visitProspect.id
              ? data as Prospect
              : item
        )
    );

    setVisitProspect(
      null
    );

    setVisitDate("");
    setSaving(false);
  }

  async function copyVisitCode(
    code: string
  ) {
    await navigator.clipboard.writeText(
      code
    );
  }

  function getOwnerWhatsappLink(
    prospect:
      Prospect
  ) {
    if (
      !prospect.listing_id ||
      !prospect.visit_at ||
      !prospect.visit_code
    ) {
      return null;
    }

    const listing =
      listingMap.get(
        prospect.listing_id
      );

    if (!listing) {
      return null;
    }

    const rawPhone =
      listing.owner_whatsapp ||
      listing.owner_phone;

    if (!rawPhone) {
      return null;
    }

    const number =
      cleanPhone(
        rawPhone
      );

    if (!number) {
      return null;
    }

    const date =
      formatVisitDate(
        prospect.visit_at
      );

    const reference =
      listing.reference ??
      "sans référence";

    const ownerName =
      listing.owner_name
        ? ` ${listing.owner_name}`
        : "";

    const text =
      `السلام عليكم ورحمة الله وبركاته${ownerName}،

لدي زيارة مجدولة لعقاركم رقم ${reference} عبر Mathwa.

موعد الزيارة: ${date}
اسم الزائر: ${prospect.name}
رمز الزيارة: ${prospect.visit_code}

إذا كان الموعد مناسبًا لكم فضلاً أكدوا لي.

بارك الله فيكم.`;

    return `https://wa.me/${number}?text=${encodeURIComponent(
      text
    )}`;
  }

  const availableListings =
    listings.filter(
      (
        listing
      ) =>
        listing.status ===
          "published" ||
        listing.status ===
          "draft"
    );

  return (
    <div>

      {/* HEADER */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700">
            Mathwa
          </p>

          <h1 className="mt-2 font-display text-4xl font-light text-ink">
            Prospects & visites
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
            Suis les demandes, organise les visites et préviens le propriétaire directement.
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            setMessage("");
            setAddOpen(
              true
            );
          }}
          className="w-fit cursor-pointer rounded-full bg-green-700 px-6 py-3 text-sm font-medium text-paper transition hover:bg-green-800"
        >
          + Nouveau prospect
        </button>

      </div>

      {/* STATS */}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          label="Total"
          value={
            stats.total
          }
        />

        <StatCard
          label="Visites prévues"
          value={
            stats.scheduled
          }
        />

        <StatCard
          label="Visités"
          value={
            stats.visited
          }
        />

        <StatCard
          label="Locations"
          value={
            stats.rented
          }
        />

      </div>

      {/* RECHERCHE */}

      <div className="mt-8 rounded-3xl border border-ink/10 bg-paper p-4 sm:p-5">

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
          placeholder="Rechercher un prospect, téléphone, annonce, quartier ou code visite..."
          className="w-full rounded-2xl border border-ink/10 bg-sand/50 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-green-700"
        />

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

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
            Tous
          </FilterButton>

          {STATUS_OPTIONS.map(
            (
              status
            ) => (
              <FilterButton
                key={
                  status.value
                }
                active={
                  filter ===
                  status.value
                }
                onClick={() =>
                  setFilter(
                    status.value
                  )
                }
              >
                {
                  status.label
                }
              </FilterButton>
            )
          )}

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

        {filteredProspects.length ===
        0 ? (

          <div className="px-6 py-16 text-center">

            <p className="font-display text-2xl text-ink">
              Aucun prospect
            </p>

            <p className="mt-2 text-sm text-ink-soft">
              Aucun résultat ne correspond à cette recherche.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1180px]">

              <thead className="border-b border-ink/10 bg-sand/50">

                <tr className="text-start text-[11px] font-medium uppercase tracking-[0.08em] text-ink-soft">

                  <th className="px-5 py-4 text-start">
                    Prospect
                  </th>

                  <th className="px-5 py-4 text-start">
                    Annonce
                  </th>

                  <th className="px-5 py-4 text-start">
                    Statut
                  </th>

                  <th className="px-5 py-4 text-start">
                    Visite
                  </th>

                  <th className="px-5 py-4 text-start">
                    Code
                  </th>

                  <th className="px-5 py-4 text-end">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-ink/8">

                {filteredProspects.map(
                  (
                    prospect
                  ) => {
                    const listing =
                      prospect.listing_id
                        ? listingMap.get(
                            prospect.listing_id
                          )
                        : null;

                    const ownerLink =
                      getOwnerWhatsappLink(
                        prospect
                      );

                    return (
                      <tr
                        key={
                          prospect.id
                        }
                        className="transition hover:bg-sand/30"
                      >

                        {/* PROSPECT */}

                        <td className="px-5 py-5">

                          <p className="font-medium text-ink">
                            {
                              prospect.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-ink-soft">
                            {
                              prospect.reference
                            }{" "}
                            ·{" "}
                            {
                              prospect.phone
                            }
                          </p>

                          {prospect.notes && (
                            <p className="mt-2 max-w-[260px] truncate text-xs text-ink-soft/80">
                              {
                                prospect.notes
                              }
                            </p>
                          )}

                        </td>

                        {/* ANNONCE */}

                        <td className="px-5 py-5">

                          {listing ? (
                            <>

                              <p className="text-sm font-semibold text-ink">
                                {
                                  listing.reference ??
                                  "Sans référence"
                                }
                              </p>

                              <p className="mt-1 text-xs font-medium text-green-700">
                                {
                                  listing.district
                                }
                              </p>

                              {listing.title_fr && (
                                <p className="mt-1 max-w-[220px] truncate text-xs text-ink-soft">
                                  {
                                    listing.title_fr
                                  }
                                </p>
                              )}

                            </>
                          ) : (

                            <span className="text-sm text-ink/30">
                              Prospect général
                            </span>

                          )}

                        </td>

                        {/* STATUT */}

                        <td className="px-5 py-5">

                          <select
                            value={
                              prospect.status
                            }
                            onChange={(
                              event
                            ) =>
                              updateStatus(
                                prospect,
                                event.target
                                  .value as ProspectStatus
                              )
                            }
                            className={`rounded-full border px-3 py-2 text-xs font-medium outline-none ${statusClass(
                              prospect.status
                            )}`}
                          >

                            {STATUS_OPTIONS.map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status.value
                                  }
                                  value={
                                    status.value
                                  }
                                >
                                  {
                                    status.label
                                  }
                                </option>
                              )
                            )}

                          </select>

                        </td>

                        {/* VISITE */}

                        <td className="px-5 py-5">

                          {prospect.visit_at ? (

                            <div>

                              <p className="text-sm font-medium text-ink">
                                {
                                  formatVisitDate(
                                    prospect.visit_at
                                  )
                                }
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  openVisitModal(
                                    prospect
                                  )
                                }
                                className="mt-2 cursor-pointer text-xs font-medium text-green-700 underline underline-offset-4"
                              >
                                Modifier
                              </button>

                            </div>

                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                openVisitModal(
                                  prospect
                                )
                              }
                              className="cursor-pointer rounded-full border border-green-700/20 bg-green-100 px-4 py-2 text-xs font-semibold text-green-800"
                            >
                              Planifier
                            </button>

                          )}

                        </td>

                        {/* CODE */}

                        <td className="px-5 py-5">

                          {prospect.visit_code ? (

                            <button
                              type="button"
                              onClick={() =>
                                copyVisitCode(
                                  prospect.visit_code!
                                )
                              }
                              className="cursor-pointer rounded-lg bg-sand px-3 py-2 font-mono text-xs font-semibold text-green-800"
                              title="Copier"
                            >
                              {
                                prospect.visit_code
                              }
                            </button>

                          ) : (

                            <span className="text-sm text-ink/30">
                              —
                            </span>

                          )}

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-5">

                          <div className="flex justify-end gap-2">

                            <a
                              href={`https://wa.me/${cleanPhone(
                                prospect.phone
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex cursor-pointer rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Client
                            </a>

                            {ownerLink ? (

                              <a
                                href={
                                  ownerLink
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex cursor-pointer rounded-full bg-green-800 px-4 py-2 text-xs font-semibold text-paper"
                              >
                                Prévenir proprio
                              </a>

                            ) : (

                              <button
                                type="button"
                                disabled
                                title={
                                  !prospect.visit_at
                                    ? "Planifie d'abord une visite"
                                    : !listing
                                      ? "Aucune annonce liée"
                                      : "WhatsApp propriétaire manquant"
                                }
                                className="rounded-full bg-ink/5 px-4 py-2 text-xs font-semibold text-ink/30"
                              >
                                Proprio
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

      {/* MODALE AJOUT */}

      {addOpen && (
        <Modal
          onClose={() =>
            setAddOpen(
              false
            )
          }
        >

          <form
            onSubmit={
              addProspect
            }
          >

            <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700">
              Mathwa
            </p>

            <h2 className="mt-2 font-display text-3xl text-ink">
              Nouveau prospect
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              Ajoute la personne et relie-la à l’annonce qui l’intéresse.
            </p>

            <div className="mt-7 space-y-5">

              <Field
                label="Nom"
              >
                <input
                  required
                  value={
                    name
                  }
                  onChange={(
                    event
                  ) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Ex. Ahmed"
                  className="mathwa-input"
                />
              </Field>

              <Field
                label="Téléphone / WhatsApp"
              >
                <input
                  required
                  value={
                    phone
                  }
                  onChange={(
                    event
                  ) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="9665..."
                  className="mathwa-input"
                />
              </Field>

              <Field
                label="Annonce"
              >

                <ListingCombobox
                  listings={
                    availableListings
                  }
                  value={
                    listingId
                  }
                  onChange={
                    setListingId
                  }
                />

              </Field>

              <Field
                label="Notes privées"
              >
                <textarea
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Ce qu'il recherche, budget, contraintes..."
                  className="mathwa-input resize-none"
                />
              </Field>

            </div>

            {message && (
              <p className="mt-4 text-sm text-red-600">
                {
                  message
                }
              </p>
            )}

            <button
              type="submit"
              disabled={
                saving
              }
              className="mt-7 w-full cursor-pointer rounded-full bg-green-700 px-6 py-3.5 text-sm font-medium text-paper transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Ajout..."
                : "Ajouter le prospect"}
            </button>

          </form>

        </Modal>
      )}

      {/* MODALE VISITE */}

      {visitProspect && (
        <Modal
          onClose={() => {
            setVisitProspect(
              null
            );

            setVisitDate("");
          }}
        >

          <form
            onSubmit={
              scheduleVisit
            }
          >

            <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700">
              Visite Mathwa
            </p>

            <h2 className="mt-2 font-display text-3xl text-ink">
              Planifier la visite
            </h2>

            <p className="mt-2 text-sm text-ink-soft">
              {
                visitProspect.name
              }{" "}
              ·{" "}
              {
                visitProspect.reference
              }
            </p>

            <div className="mt-7">

              <Field
                label="Date et heure"
              >
                <input
                  type="datetime-local"
                  required
                  value={
                    visitDate
                  }
                  onChange={(
                    event
                  ) =>
                    setVisitDate(
                      event.target.value
                    )
                  }
                  className="mathwa-input"
                />
              </Field>

            </div>

            <p className="mt-4 rounded-2xl bg-green-100 p-4 text-xs leading-5 text-green-900">
              Un code visite Mathwa sera associé à cette visite. Après l’enregistrement, le bouton « Prévenir proprio » apparaîtra dans le tableau.
            </p>

            <button
              type="submit"
              disabled={
                saving
              }
              className="mt-7 w-full cursor-pointer rounded-full bg-green-700 px-6 py-3.5 text-sm font-medium text-paper transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Enregistrement..."
                : "Confirmer la visite"}
            </button>

          </form>

        </Modal>
      )}

      <style jsx global>{`
        .mathwa-input {
          margin-top: 0.5rem;
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid rgba(18, 33, 28, 0.15);
          background: white;
          padding: 0.85rem 1rem;
          font-size: 0.875rem;
          color: #12211c;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .mathwa-input:focus {
          border-color: #0d6c55;
          box-shadow:
            0 0 0 3px rgba(13, 108, 85, 0.08);
        }

        .mathwa-admin-modal {
          cursor: auto !important;
        }

        .mathwa-admin-modal * {
          cursor: auto !important;
        }

        .mathwa-admin-modal button,
        .mathwa-admin-modal a,
        .mathwa-admin-modal select,
        .mathwa-admin-modal [role="option"] {
          cursor: pointer !important;
        }

        .mathwa-admin-modal input,
        .mathwa-admin-modal textarea {
          cursor: text !important;
        }
      `}</style>

    </div>
  );
}

/* =========================================================
   RECHERCHE ANNONCE
========================================================= */

function ListingCombobox({
  listings,
  value,
  onChange,
}: {
  listings:
    ProspectListing[];

  value:
    string;

  onChange: (
    value: string
  ) => void;
}) {
  const selectedListing =
    listings.find(
      (
        listing
      ) =>
        listing.id ===
        value
    );

  const [
    search,
    setSearch,
  ] =
    useState(
      selectedListing
        ? getListingLabel(
            selectedListing
          )
        : ""
    );

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const filteredListings =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (
        !query ||
        (
          selectedListing &&
          search ===
            getListingLabel(
              selectedListing
            )
        )
      ) {
        return listings;
      }

      return listings.filter(
        (
          listing
        ) => {
          const haystack = [
            listing.reference ??
              "",
            listing.district,
            listing.title_fr ??
              "",
          ]
            .join(" ")
            .toLowerCase();

          return haystack.includes(
            query
          );
        }
      );
    }, [
      listings,
      search,
      selectedListing,
    ]);

  function selectListing(
    listing:
      ProspectListing
  ) {
    onChange(
      listing.id
    );

    setSearch(
      getListingLabel(
        listing
      )
    );

    setOpen(false);
  }

  function clearListing() {
    onChange("");
    setSearch("");
    setOpen(true);
  }

  return (
    <div className="relative mt-2">

      <div className="relative">

        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-ink-soft">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path d="m20 20-3.5-3.5" />
          </svg>

        </div>

        <input
          type="text"
          value={
            search
          }
          autoComplete="off"
          placeholder="Rechercher par référence, quartier ou titre..."
          onFocus={() =>
            setOpen(
              true
            )
          }
          onChange={(
            event
          ) => {
            const next =
              event.target.value;

            setSearch(
              next
            );

            if (
              selectedListing &&
              next !==
                getListingLabel(
                  selectedListing
                )
            ) {
              onChange("");
            }

            setOpen(true);
          }}
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
              "Escape"
            ) {
              setOpen(false);
            }
          }}
          className="w-full rounded-2xl border border-ink/15 bg-white py-3.5 pe-12 ps-11 text-sm text-ink outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-700/5"
        />

        {search && (
          <button
            type="button"
            onClick={
              clearListing
            }
            aria-label="Effacer l'annonce"
            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-lg text-ink-soft transition hover:text-ink"
          >
            ×
          </button>
        )}

      </div>

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-[999999] overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_20px_50px_rgba(18,33,28,0.18)]">

          <div className="border-b border-ink/5 bg-sand/50 px-4 py-2.5">

            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-soft">

              {
                filteredListings.length
              }{" "}

              {filteredListings.length ===
              1
                ? "annonce"
                : "annonces"}

            </p>

          </div>

          <div className="max-h-[280px] overflow-y-auto p-2">

            <button
              type="button"
              role="option"
              onMouseDown={(
                event
              ) => {
                event.preventDefault();

                onChange("");
                setSearch("");
                setOpen(false);
              }}
              className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition hover:bg-sand"
            >

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sand text-lg text-ink-soft">
                ×
              </div>

              <div>

                <p className="text-sm font-medium text-ink">
                  Sans annonce précise
                </p>

                <p className="mt-0.5 text-xs text-ink-soft">
                  Prospect général
                </p>

              </div>

            </button>

            {filteredListings.map(
              (
                listing
              ) => {
                const selected =
                  listing.id ===
                  value;

                return (
                  <button
                    key={
                      listing.id
                    }
                    type="button"
                    role="option"
                    aria-selected={
                      selected
                    }
                    onMouseDown={(
                      event
                    ) => {
                      event.preventDefault();

                      selectListing(
                        listing
                      );
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition ${
                      selected
                        ? "bg-green-100"
                        : "hover:bg-sand"
                    }`}
                  >

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                        selected
                          ? "bg-green-700 text-paper"
                          : "bg-sand text-green-800"
                      }`}
                    >
                      {listing.reference
                        ?.replace(
                          "MTH-",
                          ""
                        )
                        .slice(
                          -3
                        ) ??
                        "M"}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2">

                        <p className="shrink-0 text-sm font-semibold text-ink">
                          {
                            listing.reference ??
                            "Sans référence"
                          }
                        </p>

                        {selected && (
                          <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] font-medium text-paper">
                            Sélectionnée
                          </span>
                        )}

                      </div>

                      <p className="mt-0.5 truncate text-xs font-medium text-green-700">
                        {
                          listing.district
                        }
                      </p>

                      {listing.title_fr && (
                        <p className="mt-0.5 truncate text-xs text-ink-soft">
                          {
                            listing.title_fr
                          }
                        </p>
                      )}

                    </div>

                  </button>
                );
              }
            )}

            {filteredListings.length ===
              0 && (

              <div className="px-5 py-8 text-center">

                <p className="text-sm font-medium text-ink">
                  Aucune annonce trouvée
                </p>

                <p className="mt-1 text-xs text-ink-soft">
                  Essaie une référence ou un autre quartier.
                </p>

              </div>

            )}

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   PETITS COMPOSANTS
========================================================= */

function StatCard({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper p-5">

      <p className="text-xs text-ink-soft">
        {
          label
        }
      </p>

      <p className="mt-2 font-display text-3xl text-ink">
        {
          value
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
    ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-medium transition ${
        active
          ? "bg-green-700 text-paper"
          : "border border-ink/10 bg-paper text-ink"
      }`}
    >
      {
        children
      }
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label:
    string;

  children:
    ReactNode;
}) {
  return (
    <label className="block">

      <span className="text-sm font-medium text-ink">
        {
          label
        }
      </span>

      {
        children
      }

    </label>
  );
}

function Modal({
  children,
  onClose,
}: {
  children:
    ReactNode;

  onClose:
    () => void;
}) {
  return (
    <div
      className="mathwa-admin-modal fixed inset-0 z-[2147483000] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-sm"
      style={{
        cursor:
          "auto",
      }}
    >

      <button
        type="button"
        aria-label="Fermer"
        onClick={
          onClose
        }
        className="absolute inset-0 cursor-default"
      />

      <div
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-visible rounded-[28px] bg-paper p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-8"
        style={{
          cursor:
            "auto",
        }}
      >

        <div className="max-h-[calc(90vh-3rem)] overflow-y-auto overflow-x-visible pe-1">

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Fermer"
            className="absolute end-5 top-5 z-50 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-ink text-xl text-paper transition hover:scale-105 hover:bg-green-900"
          >
            ×
          </button>

          {
            children
          }

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getListingLabel(
  listing:
    ProspectListing
) {
  return [
    listing.reference,
    listing.district,
    listing.title_fr,
  ]
    .filter(
      Boolean
    )
    .join(
      " · "
    );
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

  /*
   * Formats saoudiens courants :
   * 05XXXXXXXX
   * 5XXXXXXXX
   */
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

function formatVisitDate(
  value:
    string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",

      timeZone:
        "Asia/Riyadh",
    }
  ).format(
    new Date(
      value
    )
  );
}

function toDatetimeLocal(
  value:
    string
) {
  const date =
    new Date(
      value
    );

  const offset =
    date.getTimezoneOffset();

  const local =
    new Date(
      date.getTime() -
        offset *
          60_000
    );

  return local
    .toISOString()
    .slice(
      0,
      16
    );
}

function createNextVisitCode(
  prospects:
    Prospect[]
) {
  const highest =
    prospects.reduce(
      (
        max,
        prospect
      ) => {
        const match =
          prospect.visit_code?.match(
            /^V-(\d+)$/
          );

        if (!match) {
          return max;
        }

        const value =
          Number(
            match[1]
          );

        return Number.isFinite(
          value
        )
          ? Math.max(
              max,
              value
            )
          : max;
      },
      0
    );

  return `V-${String(
    highest +
      1
  ).padStart(
    5,
    "0"
  )}`;
}

function statusClass(
  status:
    ProspectStatus
) {
  switch (
    status
  ) {
    case "new":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "contacted":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "visit_scheduled":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "visited":
      return "border-green-200 bg-green-50 text-green-700";

    case "rented":
      return "border-green-800 bg-green-800 text-white";

    case "lost":
      return "border-red-200 bg-red-50 text-red-700";
  }
}