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

import {
  processVideoForMathwa,
} from "@/lib/media/processVideo";

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

  async function cleanupR2Key(
    key: string
  ) {
    try {
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
              key,
              clearDatabase:
                false,
            }),
        }
      );
    } catch (
      cleanupError
    ) {
      console.error(
        "Erreur nettoyage R2 :",
        cleanupError
      );
    }
  }

  async function uploadVideo(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target
        .files?.[0];

    if (
      !file
    ) {
      return;
    }

    setError(
      ""
    );

    setStatus(
      ""
    );

    setProgress(
      0
    );

    const allowed =
      [
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ];

    if (
      !allowed.includes(
        file.type
      )
    ) {
      setError(
        "Utilise une vidéo MP4, WebM ou MOV."
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
      /*
       * 1.
       * Compression + conversion MP4
       * + filigrane dans le navigateur.
       */

      const processed =
        await processVideoForMathwa(
          file,
          (
            value,
            label
          ) => {
            setProgress(
              value
            );

            setStatus(
              label
            );
          }
        );

      /*
       * 2.
       * Demande une URL R2 présignée
       * pour LE fichier déjà traité.
       */

      setStatus(
        "Préparation de l'envoi vers le stockage..."
      );

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
                  processed.name,

                contentType:
                  processed.type,

                fileSize:
                  processed.size,
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

      newKey =
        signed.key;

      /*
       * 3.
       * Upload direct vers R2.
       */

      setStatus(
        "Envoi de la vidéo vers Cloudflare..."
      );

      setProgress(
        98
      );

      const uploadResponse =
        await fetch(
          signed.uploadUrl,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                processed.type,
            },

            body:
              processed,
          }
        );

      if (
        !uploadResponse.ok
      ) {
        throw new Error(
          "Impossible d'envoyer la vidéo vers Cloudflare."
        );
      }

      /*
       * 4.
       * Enregistrement du nouveau chemin
       * dans Supabase.
       */

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

      newKey =
        null;

      /*
       * 5.
       * Supprime l'ancienne vidéo R2
       * après que la nouvelle est prête.
       */

      if (
        oldPath &&
        oldPath !==
          signed.key
      ) {
        await cleanupR2Key(
          oldPath
        );
      }

      setProgress(
        100
      );

      setStatus(
        "Vidéo compressée, filigranée et envoyée ✅"
      );

      router.refresh();
    } catch (
      uploadError
    ) {
      if (
        newKey
      ) {
        await cleanupR2Key(
          newKey
        );
      }

      setStatus(
        ""
      );

      setProgress(
        0
      );

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

    setStatus(
      "Suppression..."
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

      setStatus(
        ""
      );

      setProgress(
        0
      );

      router.refresh();
    } catch (
      deleteError
    ) {
      setStatus(
        ""
      );

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
            MP4, WebM ou MOV · 300 Mo maximum
          </p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-ink-soft/70">
            Mathwa convertit automatiquement la vidéo en MP4,
            la compresse et ajoute le filigrane avant l'envoi.
            Pour les grosses vidéos, utilise de préférence un
            ordinateur.
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
            : videoPath
              ? "Remplacer la vidéo"
              : "+ Ajouter une vidéo"}

          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mov"
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

      {loading &&
        status && (
          <div className="mt-6 rounded-2xl border border-green-700/10 bg-green-100/50 p-4">

            <div className="flex items-center justify-between gap-4 text-sm">

              <span className="text-green-900">
                {status}
              </span>

              <span className="shrink-0 font-medium text-green-800">
                {progress} %
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