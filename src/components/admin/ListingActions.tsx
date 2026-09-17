"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ListingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function changeStatus(newStatus: string) {
    setLoading(true);

    const supabase = createClient();

    await supabase
      .from("listings")
      .update({
        status: newStatus,
        published_at:
          newStatus === "published"
            ? new Date().toISOString()
            : null,
      })
      .eq("id", id);

    router.refresh();
    setLoading(false);
  }

  async function deleteListing() {
    const confirmation = window.confirm(
      "Supprimer définitivement cette annonce ?"
    );

    if (!confirmation) return;

    setLoading(true);

    const supabase = createClient();

    const { data: images } = await supabase
      .from("listing_images")
      .select("storage_path")
      .eq("listing_id", id);

    if (images?.length) {
      await supabase.storage
        .from("listing-images")
        .remove(images.map((image) => image.storage_path));
    }

    await supabase.from("listings").delete().eq("id", id);

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "published" && (
        <button
          disabled={loading}
          onClick={() => changeStatus("published")}
          className="rounded-full bg-green-700 px-4 py-2 text-xs font-medium text-paper transition hover:bg-green-800 disabled:opacity-50"
        >
          Publier
        </button>
      )}

      {status === "published" && (
        <button
          disabled={loading}
          onClick={() => changeStatus("draft")}
          className="rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink transition hover:bg-sand disabled:opacity-50"
        >
          Mettre en brouillon
        </button>
      )}

      {status !== "rented" && (
        <button
          disabled={loading}
          onClick={() => changeStatus("rented")}
          className="rounded-full border border-gold/40 px-4 py-2 text-xs font-medium text-ink transition hover:bg-sand disabled:opacity-50"
        >
          Marquer loué
        </button>
      )}

      <button
        disabled={loading}
        onClick={deleteListing}
        className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
      >
        Supprimer
      </button>
    </div>
  );
}