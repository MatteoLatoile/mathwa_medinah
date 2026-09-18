"use client";

import {
  ChangeEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

type Props = {
  listingId: string;
  initialVideoPath:
    | string
    | null;
  initialVideoUrl:
    | string
    | null;
};

type PresignResponse = {
  key?: string;
  uploadUrl?: string;
  publicUrl?: string;
  error?: string;
};

const MAX_VIDEO_SIZE =
  300 *
  1024 *
  1024;

export default function ListingVideoManager({
  listingId,
  initialVideoPath,
  initialVideoUrl,
}: Props) {
  const router =
    useRouter();

  const [
    videoPath,
    setVideoPath,
  ] =
    useState<
      string | null
    >(
      initialVideoPath
    );

  const [
    videoUrl,
    setVideoUrl,
  ] =
    useState<
      string | null
    >(
      initialVideoUrl
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

  async function uploadVideo(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (
      ![
        "video/mp4",
        "video/webm",
      ].includes(
        file.type
      )
    ) {
      setError(
        "Utilise une vidéo MP4 ou WebM."
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      MAX_VIDEO_SIZE
    ) {
      setError(
        "La vidéo ne doit pas dépasser 300 Mo."
      );

      event.target.value =
        "";

      return;
    }

    setLoading(
      true
    );

    let newKey:
      | string
      | null =
      null;

    try {
      const signResponse =
        await fetch(
          "/api/r2/video",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                listingId,
                fileName:
                  file.name,
                contentType:
                  file.type,
                fileSize:
                  file.size,
              }),
          }
        );

      const signed =
        (
          await signResponse.json()
        ) as PresignResponse;

      if (
        !signResponse.ok ||
        !signed.uploadUrl ||
        !signed.key ||
        !signed.publicUrl
      ) {
        throw new Error(
          signed.error ??
          "Impossible de préparer l'envoi."
        );
      }

      const uploadResponse =
        await fetch(
          signed.uploadUrl,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                file.type,
            },

            body:
              file,
          }
        );

      if (
        !uploadResponse.ok
      ) {
        throw new Error(
          "Impossible d'envoyer la vidéo vers Cloudflare."
        );
      }

      newKey =
        signed.key;

      const supabase =
        createClient();

      const {
        error:
          databaseError,
      } =
        await supabase
          .from(
            "listings"
          )
          .update({
            video_path:
              signed.key,
          })
          .eq(
            "id",
            listingId
          );

      if (
        databaseError
      ) {
        throw databaseError;
      }

      const oldPath =
        videoPath;

      setVideoPath(
        signed.key
      );

      setVideoUrl(
        signed.publicUrl
      );

      if (
        oldPath &&
        oldPath !==
          signed.key
      ) {
        await fetch(
          "/api/r2/video",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                listingId,
                key:
                  oldPath,
                clearDatabase:
                  false,
              }),
          }
        );
      }

      router.refresh();
    } catch (
      uploadError
    ) {
      if (
        newKey
      ) {
        await fetch(
          "/api/r2/video",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                listingId,
                key:
                  newKey,
                clearDatabase:
                  false,
              }),
          }
        );
      }

      setError(
        uploadError instanceof
          Error
          ? uploadError.message
          : "Erreur pendant l'envoi de la vidéo."
      );
    } finally {
      event.target.value =
        "";

      setLoading(
        false
      );
    }
  }

  async function deleteVideo() {
    if (
      !videoPath
    ) {
      return;
    }

    const confirmation =
      window.confirm(
        "Supprimer la vidéo de cette annonce ?"
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

    try {
      const response =
        await fetch(
          "/api/r2/video",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                listingId,
                key:
                  videoPath,
                clearDatabase:
                  true,
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result.error ??
          "Impossible de supprimer la vidéo."
        );
      }

      setVideoPath(
        null
      );

      setVideoUrl(
        null
      );

      router.refresh();
    } catch (
      deleteError
    ) {
      setError(
        deleteError instanceof
          Error
          ? deleteError.message
          : "Erreur pendant la suppression."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  return (
    <section className="rounded-3xl border border-ink/10 bg-paper p-6 sm:p-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="text-xs font-medium uppercase tracking-[0.15em] text-green-700">
            Média
          </p>

          <h2 className="mt-2 font-display text-2xl text-ink">
            Vidéo de présentation
          </h2>

          <p className="mt-1 text-sm text-ink-soft">
            MP4 ou WebM · 300 Mo maximum
          </p>

        </div>

        <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-green-700 px-5 py-3 text-sm font-medium text-paper transition hover:bg-green-800">

          {loading
            ? "Envoi..."
            : videoPath
              ? "Remplacer la vidéo"
              : "+ Ajouter une vidéo"}

          <input
            type="file"
            accept="video/mp4,video/webm"
            disabled={
              loading
            }
            onChange={
              uploadVideo
            }
            className="hidden"
          />

        </label>

      </div>

      {error && (
        <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {videoUrl && (
        <div className="mt-7">

          <div className="overflow-hidden rounded-2xl bg-ink">

            <video
              src={
                videoUrl
              }
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full object-contain"
            />

          </div>

          <div className="mt-4 flex justify-end">

            <button
              type="button"
              onClick={
                deleteVideo
              }
              disabled={
                loading
              }
              className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
            >
              Supprimer la vidéo
            </button>

          </div>

        </div>
      )}

    </section>
  );
}