"use client";

import {
  ChangeEvent,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  processImageForMathwa,
} from "@/lib/media/processImage";

type ImageItem = {
  id: string;
  storage_path: string;
  position: number;
  is_cover: boolean;
  publicUrl: string;
};

export default function ListingPhotosManager({
  listingId,
  initialImages,
}: {
  listingId: string;
  initialImages: ImageItem[];
}) {
  const [
    images,
    setImages,
  ] =
    useState(
      initialImages
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState("");

  const [
    progress,
    setProgress,
  ] =
    useState(0);

  async function uploadPhotos(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const files =
      Array.from(
        event.target.files ??
          []
      );

    if (
      !files.length
    ) {
      return;
    }

    setLoading(
      true
    );

    setError(
      ""
    );

    setStatus(
      ""
    );

    setProgress(
      0
    );

    const supabase =
      createClient();

    const uploadedPaths:
      string[] =
      [];

    const insertedIds:
      string[] =
      [];

    try {
      const currentMax =
        images.length >
        0
          ? Math.max(
              ...images.map(
                (
                  image
                ) =>
                  image.position
              )
            )
          : -1;

      const newImages:
        ImageItem[] =
        [];

      for (
        let index = 0;
        index <
        files.length;
        index++
      ) {
        const file =
          files[index];

        setStatus(
          `Traitement de la photo ${index + 1}/${files.length}...`
        );

        setProgress(
          Math.round(
            (
              index /
              files.length
            ) *
              100
          )
        );

        /*
         * Conversion WebP
         * + compression
         * + redimensionnement
         * + filigrane Mathwa.
         */
        const processedFile =
          await processImageForMathwa(
            file
          );

        setStatus(
          `Envoi de la photo ${index + 1}/${files.length}...`
        );

        const path =
          `${listingId}/` +
          `${crypto.randomUUID()}.webp`;

        const {
          error:
            uploadError,
        } =
          await supabase.storage
            .from(
              "listing-images"
            )
            .upload(
              path,
              processedFile,
              {
                cacheControl:
                  "3600",

                upsert:
                  false,

                contentType:
                  "image/webp",
              }
            );

        if (
          uploadError
        ) {
          throw uploadError;
        }

        uploadedPaths.push(
          path
        );

        const position =
          currentMax +
          index +
          1;

        const shouldBeCover =
          images.length ===
            0 &&
          newImages.length ===
            0;

        const {
          data:
            inserted,
          error:
            dbError,
        } =
          await supabase
            .from(
              "listing_images"
            )
            .insert({
              listing_id:
                listingId,

              storage_path:
                path,

              position,

              is_cover:
                shouldBeCover,
            })
            .select(`
              id,
              storage_path,
              position,
              is_cover
            `)
            .single();

        if (
          dbError
        ) {
          throw dbError;
        }

        insertedIds.push(
          inserted.id
        );

        const {
          data:
            urlData,
        } =
          supabase.storage
            .from(
              "listing-images"
            )
            .getPublicUrl(
              path
            );

        newImages.push({
          ...inserted,

          publicUrl:
            urlData.publicUrl,
        });

        setProgress(
          Math.round(
            (
              (
                index +
                1
              ) /
              files.length
            ) *
              100
          )
        );
      }

      setImages(
        (
          current
        ) =>
          [
            ...current,
            ...newImages,
          ].sort(
            (
              a,
              b
            ) =>
              a.position -
              b.position
          )
      );

      setStatus(
        `${files.length} photo${files.length > 1 ? "s" : ""} convertie${files.length > 1 ? "s" : ""}, compressée${files.length > 1 ? "s" : ""} et filigranée${files.length > 1 ? "s" : ""} ✅`
      );
    } catch (
      err
    ) {
      if (
        insertedIds.length >
        0
      ) {
        await supabase
          .from(
            "listing_images"
          )
          .delete()
          .in(
            "id",
            insertedIds
          );
      }

      if (
        uploadedPaths.length >
        0
      ) {
        await supabase.storage
          .from(
            "listing-images"
          )
          .remove(
            uploadedPaths
          );
      }

      setStatus(
        ""
      );

      setProgress(
        0
      );

      setError(
        err instanceof
          Error
          ? err.message
          : "Erreur pendant l'ajout des photos."
      );
    } finally {
      event.target.value =
        "";

      setLoading(
        false
      );
    }
  }

  async function setCover(
    imageId: string
  ) {
    setLoading(
      true
    );

    setError(
      ""
    );

    setStatus(
      ""
    );

    const supabase =
      createClient();

    const {
      error:
        resetError,
    } =
      await supabase
        .from(
          "listing_images"
        )
        .update({
          is_cover:
            false,
        })
        .eq(
          "listing_id",
          listingId
        );

    if (
      resetError
    ) {
      setError(
        resetError.message
      );

      setLoading(
        false
      );

      return;
    }

    const {
      error:
        coverError,
    } =
      await supabase
        .from(
          "listing_images"
        )
        .update({
          is_cover:
            true,
        })
        .eq(
          "id",
          imageId
        );

    if (
      coverError
    ) {
      setError(
        coverError.message
      );

      setLoading(
        false
      );

      return;
    }

    setImages(
      (
        current
      ) =>
        current.map(
          (
            image
          ) => ({
            ...image,

            is_cover:
              image.id ===
              imageId,
          })
        )
    );

    setLoading(
      false
    );
  }

  async function deleteImage(
    image: ImageItem
  ) {
    const confirmation =
      window.confirm(
        "Supprimer cette photo ?"
      );

    if (
      !confirmation
    ) {
      return;
    }

    setLoading(
      true
    );

    setError(
      ""
    );

    setStatus(
      ""
    );

    const supabase =
      createClient();

    const {
      error:
        storageError,
    } =
      await supabase.storage
        .from(
          "listing-images"
        )
        .remove([
          image.storage_path,
        ]);

    if (
      storageError
    ) {
      setError(
        storageError.message
      );

      setLoading(
        false
      );

      return;
    }

    const {
      error:
        databaseError,
    } =
      await supabase
        .from(
          "listing_images"
        )
        .delete()
        .eq(
          "id",
          image.id
        );

    if (
      databaseError
    ) {
      setError(
        databaseError.message
      );

      setLoading(
        false
      );

      return;
    }

    const remaining =
      images.filter(
        (
          item
        ) =>
          item.id !==
          image.id
      );

    setImages(
      remaining
    );

    if (
      image.is_cover &&
      remaining.length >
        0
    ) {
      await setCover(
        remaining[0].id
      );

      return;
    }

    setLoading(
      false
    );
  }

  return (
    <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="font-display text-2xl text-ink">
            Photos
          </h2>

          <p className="mt-1 text-sm text-ink-soft">
            {images.length} photo
            {images.length > 1
              ? "s"
              : ""}
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-ink-soft/70">
            Les photos ajoutées sont automatiquement converties
            en WebP, compressées et filigranées avant l'envoi.
          </p>

        </div>

        <label
          className={`inline-flex items-center justify-center rounded-full bg-green-700 px-5 py-3 text-sm font-medium text-paper transition ${
            loading
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-green-800"
          }`}
        >

          {loading
            ? "Traitement..."
            : "+ Ajouter des photos"}

          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={
              uploadPhotos
            }
            disabled={
              loading
            }
            className="hidden"
          />

        </label>

      </div>

      {loading &&
        status && (
          <div className="mt-6 rounded-2xl border border-green-700/10 bg-green-100/50 p-4">

            <div className="flex items-center justify-between gap-4 text-sm">

              <span className="text-green-900">
                {status}
              </span>

              <span className="shrink-0 font-medium text-green-800">
                {progress}%
              </span>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-green-900/10">

              <div
                className="h-full rounded-full bg-green-700 transition-all duration-300"
                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>

          </div>
        )}

      {!loading &&
        status && (
          <div className="mt-5 rounded-2xl bg-green-100 p-4 text-sm text-green-900">
            {status}
          </div>
        )}

      {error && (
        <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {images.length >
      0 ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {images.map(
            (
              image
            ) => (

              <div
                key={
                  image.id
                }
                className="overflow-hidden rounded-2xl border border-ink/10"
              >

                <div className="relative aspect-[4/3] bg-sand-deep">

                  <img
                    src={
                      image.publicUrl
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />

                  {image.is_cover && (

                    <span className="absolute start-3 top-3 rounded-full bg-green-700 px-3 py-1.5 text-xs font-medium text-paper">
                      Couverture
                    </span>

                  )}

                </div>

                <div className="flex gap-2 p-3">

                  {!image.is_cover && (

                    <button
                      type="button"
                      disabled={
                        loading
                      }
                      onClick={() =>
                        setCover(
                          image.id
                        )
                      }
                      className="flex-1 rounded-full border border-ink/15 px-3 py-2 text-xs font-medium text-ink hover:bg-sand"
                    >
                      Mettre en couverture
                    </button>

                  )}

                  <button
                    type="button"
                    disabled={
                      loading
                    }
                    onClick={() =>
                      deleteImage(
                        image
                      )
                    }
                    className="rounded-full border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Supprimer
                  </button>

                </div>

              </div>

            )
          )}

        </div>
      ) : (

        <div className="mt-7 rounded-2xl border border-dashed border-ink/15 bg-sand/40 px-6 py-12 text-center text-sm text-ink-soft">
          Aucune photo pour cet appartement.
        </div>

      )}

    </section>
  );
}