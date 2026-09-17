"use client";

import {
  useEffect,
  useState,
} from "react";

import { useLocale } from "next-intl";

import { createClient } from "@/lib/supabase/client";

type District = {
  id: string;
  name: string;
};

export default function DistrictSelect({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const locale =
    useLocale();

  const [
    districts,
    setDistricts,
  ] =
    useState<District[]>(
      []
    );

  const [
    value,
    setValue,
  ] =
    useState(
      defaultValue
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  useEffect(() => {
    setValue(
      defaultValue
    );
  }, [
    defaultValue,
  ]);

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      const supabase =
        createClient();

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "districts"
          )
          .select(
            "id, name"
          )
          .eq(
            "active",
            true
          )
          .order(
            "sort_order",
            {
              ascending:
                true,
            }
          )
          .order(
            "name",
            {
              ascending:
                true,
            }
          );

      if (
        cancelled
      ) {
        return;
      }

      if (error) {
        console.error(
          error
        );
      }

      setDistricts(
        data ?? []
      );

      setLoading(
        false
      );
    }

    load();

    return () => {
      cancelled =
        true;
    };
  }, []);

  const currentMissing =
    value &&
    !districts.some(
      (district) =>
        district.name ===
        value
    );

  return (
    <div>
      <select
        name="district"
        required
        value={value}
        disabled={
          loading
        }
        onChange={(
          event
        ) =>
          setValue(
            event.target
              .value
          )
        }
        className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-green-700 disabled:opacity-60"
      >
        <option value="">
          {loading
            ? "Chargement..."
            : "Choisir un quartier"}
        </option>

        {currentMissing && (
          <option
            value={
              value
            }
          >
            {value}
          </option>
        )}

        {districts.map(
          (
            district
          ) => (
            <option
              key={
                district.id
              }
              value={
                district.name
              }
            >
              {
                district.name
              }
            </option>
          )
        )}
      </select>

      <a
        href={`/${locale}/admin/quartiers`}
        className="mt-2 inline-block text-xs font-medium text-green-700 underline underline-offset-4"
      >
        Gérer les quartiers
      </a>
    </div>
  );
}