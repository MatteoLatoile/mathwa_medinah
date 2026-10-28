import {
  CalendarDays,
  MessageCircle,
  Phone,
  UserRound,
} from "lucide-react";

import {
  createClient,
} from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

function statusLabel(
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

function statusStyle(
  status: string
) {
  switch (status) {
    case "new":
      return "bg-green-100 text-green-800";

    case "visit_scheduled":
      return "bg-gold/15 text-ink";

    case "rented":
      return "bg-green-700 text-paper";

    case "lost":
      return "bg-red-50 text-red-700";

    default:
      return "bg-sand-deep text-ink-soft";
  }
}

function formatDate(
  date: string | null
) {
  if (!date) {
    return null;
  }

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
    new Date(date)
  );
}

export default async function PocketProspectsPage() {
  const supabase =
    await createClient();

  const {
    data:
      prospects,
    error,
  } =
    await supabase
      .from("prospects")
      .select(`
        id,
        reference,
        listing_id,
        name,
        phone,
        status,
        visit_at,
        visit_code,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(50);

  if (error) {
    throw new Error(
      error.message
    );
  }

  const rows =
    prospects ??
    [];

  const scheduled =
    rows.filter(
      (prospect) =>
        prospect.status ===
        "visit_scheduled"
    ).length;

  return (
    <div>
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-green-700">
          Mathwa Pocket
        </p>

        <h1 className="mt-1 font-display text-3xl text-ink">
          Prospects
        </h1>

        <p className="mt-2 text-sm text-ink-soft">
          {rows.length} prospect
          {rows.length > 1
            ? "s"
            : ""}{" "}
          · {scheduled} visite
          {scheduled > 1
            ? "s"
            : ""}{" "}
          prévue
          {scheduled > 1
            ? "s"
            : ""}
        </p>
      </header>

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-[22px] border border-ink/10 bg-paper px-5 py-12 text-center">
            <UserRound className="mx-auto h-7 w-7 text-green-700" />

            <p className="mt-3 text-sm text-ink-soft">
              Aucun prospect.
            </p>
          </div>
        ) : (
          rows.map(
            (prospect) => {
              const cleanPhone =
                String(
                  prospect.phone ??
                    ""
                ).replace(
                  /\D/g,
                  ""
                );

              const visitDate =
                formatDate(
                  prospect.visit_at
                );

              return (
                <article
                  key={prospect.id}
                  className="rounded-[22px] border border-ink/10 bg-paper p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {prospect.name}
                      </p>

                      <p className="mt-1 text-[11px] text-green-700">
                        {prospect.reference}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${statusStyle(
                        prospect.status
                      )}`}
                    >
                      {statusLabel(
                        prospect.status
                      )}
                    </span>
                  </div>

                  {visitDate && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-sand px-3 py-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />

                      <div>
                        <p className="text-xs font-semibold text-ink">
                          {visitDate}
                        </p>

                        {prospect.visit_code && (
                          <p className="mt-1 text-[10px] text-ink-soft">
                            Code :{" "}
                            {prospect.visit_code}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${prospect.phone}`}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-green-700/15 bg-green-100 text-xs font-semibold text-green-800"
                    >
                      <Phone className="h-4 w-4" />
                      Appeler
                    </a>

                    {cleanPhone ? (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 text-xs font-semibold text-paper"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    ) : (
                      <div className="flex min-h-11 items-center justify-center rounded-xl bg-sand text-xs text-ink-soft">
                        Pas de numéro
                      </div>
                    )}
                  </div>
                </article>
              );
            }
          )
        )}
      </div>
    </div>
  );
}
