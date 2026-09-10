"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const selectClass =
  "w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm text-ink transition-colors hover:border-ink/30 focus:border-green-700";

/**
 * Barre de filtres. L'état est local pour l'instant :
 * il sera branché sur la requête Supabase quand les annonces existeront.
 */
export default function FilterBar({
  view,
  onViewChange,
}: {
  view: "list" | "map";
  onViewChange: (v: "list" | "map") => void;
}) {
  const t = useTranslations("filters");
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-ink/10 bg-sand p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <select className={selectClass} defaultValue="">
          <option value="">{t("allDistricts")}</option>
        </select>
        <select className={selectClass} defaultValue="">
          <option value="">{t("priceMin")}</option>
        </select>
        <select className={selectClass} defaultValue="">
          <option value="">{t("priceMax")}</option>
        </select>
        <select className={selectClass} defaultValue="">
          <option value="">{t("period")}</option>
        </select>
        <select className={selectClass} defaultValue="">
          <option value="">{t("rooms")}</option>
        </select>
      </div>

      {expanded && (
        <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <select className={selectClass} defaultValue="">
            <option value="">{t("bathrooms")}</option>
          </select>
          <select className={selectClass} defaultValue="">
            <option value="">{t("floor")}</option>
          </select>
          <select className={selectClass} defaultValue="">
            <option value="">{t("furnished")}</option>
          </select>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="text-sm text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
        >
          {t("more")}
        </button>

        <div className="flex gap-1.5 rounded-full bg-ink/5 p-1">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange(v)}
              aria-pressed={view === v}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                view === v
                  ? "bg-green-700 text-paper"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {v === "list" ? t("viewList") : t("viewMap")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
