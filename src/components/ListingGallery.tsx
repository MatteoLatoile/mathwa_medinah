"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Images,
  Play,
  X,
} from "lucide-react";

type MediaItem =
  | {
      type:
        "photo";
      src:
        string;
    }
  | {
      type:
        "video";
      src:
        string;
    };

type Labels = {
  viewAllLabel:
    string;
  close:
    string;
  previous:
    string;
  next:
    string;
  video?:
    string;
  playVideo?:
    string;
};

export default function ListingGallery({
  photos,
  videoUrl = null,
  alt,
  labels,
}: {
  photos: string[];
  videoUrl?:
    | string
    | null;
  alt: string;
  labels: Labels;
}) {
  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    activeIndex,
    setActiveIndex,
  ] =
    useState(0);

  const media =
    useMemo<
      MediaItem[]
    >(
      () => [
        ...photos.map(
          (
            photo
          ) => ({
            type:
              "photo" as const,
            src:
              photo,
          })
        ),

        ...(
          videoUrl
            ? [
                {
                  type:
                    "video" as const,
                  src:
                    videoUrl,
                },
              ]
            : []
        ),
      ],
      [
        photos,
        videoUrl,
      ]
    );

  const mainMedia =
    photos[0]
      ? {
          type:
            "photo" as const,
          src:
            photos[0],
          index:
            0,
        }
      : videoUrl
        ? {
            type:
              "video" as const,
            src:
              videoUrl,
            index:
              0,
          }
        : null;

  const rightTop =
    photos[1]
      ? {
          type:
            "photo" as const,
          src:
            photos[1],
          index:
            1,
        }
      : videoUrl &&
          photos.length >
            0
        ? {
            type:
              "video" as const,
            src:
              videoUrl,
            index:
              photos.length,
          }
        : null;

  const rightBottom =
    videoUrl &&
    photos.length >=
      2
      ? {
          type:
            "video" as const,
          src:
            videoUrl,
          index:
            photos.length,
        }
      : photos[2]
        ? {
            type:
              "photo" as const,
            src:
              photos[2],
            index:
              2,
          }
        : null;

  function showMedia(
    index: number
  ) {
    setActiveIndex(
      index
    );

    setOpen(
      true
    );
  }

  function previous() {
    setActiveIndex(
      (
        current
      ) =>
        current ===
        0
          ? media.length -
            1
          : current -
            1
    );
  }

  function next() {
    setActiveIndex(
      (
        current
      ) =>
        current ===
        media.length -
          1
          ? 0
          : current +
            1
    );
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function keyDown(
      event:
        KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(
          false
        );
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        previous();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        next();
      }
    }

    window.addEventListener(
      "keydown",
      keyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        keyDown
      );
    };
  }, [
    open,
    media.length,
  ]);

  if (
    !mainMedia
  ) {
    return (
      <div className="flex aspect-[16/7] items-center justify-center rounded-3xl bg-sand-deep text-sm text-ink-soft">
        Aucune photo
      </div>
    );
  }

  const activeMedia =
    media[
      activeIndex
    ];

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl">

        <div className="grid gap-2 md:h-[520px] md:grid-cols-[2fr_1fr] md:grid-rows-2">

          <MediaTile
            media={
              mainMedia
            }
            alt={
              alt
            }
            videoLabel={
              labels.video ??
              "Visite vidéo"
            }
            playLabel={
              labels.playVideo ??
              "Lire la vidéo"
            }
            onClick={() =>
              showMedia(
                mainMedia.index
              )
            }
            className="aspect-[4/3] md:row-span-2 md:aspect-auto"
          />

          {rightTop && (
            <MediaTile
              media={
                rightTop
              }
              alt={
                alt
              }
              videoLabel={
                labels.video ??
                "Visite vidéo"
              }
              playLabel={
                labels.playVideo ??
                "Lire la vidéo"
              }
              onClick={() =>
                showMedia(
                  rightTop.index
                )
              }
              className="aspect-[16/10] md:aspect-auto"
            />
          )}

          {rightBottom && (
            <MediaTile
              media={
                rightBottom
              }
              alt={
                alt
              }
              videoLabel={
                labels.video ??
                "Visite vidéo"
              }
              playLabel={
                labels.playVideo ??
                "Lire la vidéo"
              }
              onClick={() =>
                showMedia(
                  rightBottom.index
                )
              }
              className="aspect-[16/10] md:aspect-auto"
            />
          )}

        </div>

        {media.length >
          1 && (

          <button
            type="button"
            onClick={() =>
              showMedia(
                0
              )
            }
            className="absolute bottom-4 end-4 inline-flex items-center gap-2 rounded-full bg-paper/95 px-4 py-2.5 text-xs font-medium text-ink shadow-lg backdrop-blur transition hover:bg-paper"
          >
            <Images
              className="h-4 w-4"
              aria-hidden="true"
            />

            {
              labels.viewAllLabel
            }

          </button>

        )}

      </div>

      {open &&
        activeMedia && (

        <div className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-black/95 p-4 sm:p-8">

          <button
            type="button"
            aria-label={
              labels.close
            }
            onClick={() =>
              setOpen(
                false
              )
            }
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 flex h-full w-full max-w-7xl items-center justify-center">

            <button
              type="button"
              aria-label={
                labels.close
              }
              onClick={() =>
                setOpen(
                  false
                )
              }
              className="absolute end-0 top-0 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            >
              <X
                className="h-5 w-5"
              />
            </button>

            {media.length >
              1 && (

              <button
                type="button"
                aria-label={
                  labels.previous
                }
                onClick={
                  previous
                }
                className="absolute start-0 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                <ChevronLeft
                  className="h-6 w-6"
                />
              </button>

            )}

            <div className="flex h-full w-full items-center justify-center px-0 sm:px-16">

              {activeMedia.type ===
              "video" ? (

                <video
                  key={
                    activeMedia.src
                  }
                  src={
                    activeMedia.src
                  }
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="max-h-[88vh] max-w-full rounded-2xl bg-black"
                />

              ) : (

                <img
                  src={
                    activeMedia.src
                  }
                  alt={
                    alt
                  }
                  className="max-h-[88vh] max-w-full rounded-2xl object-contain"
                />

              )}

            </div>

            {media.length >
              1 && (

              <button
                type="button"
                aria-label={
                  labels.next
                }
                onClick={
                  next
                }
                className="absolute end-0 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                <ChevronRight
                  className="h-6 w-6"
                />
              </button>

            )}

            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-2 text-xs text-white/80 backdrop-blur">
              {activeIndex +
                1}{" "}
              /{" "}
              {
                media.length
              }
            </div>

          </div>

        </div>

      )}
    </>
  );
}

function MediaTile({
  media,
  alt,
  videoLabel,
  playLabel,
  onClick,
  className = "",
}: {
  media: {
    type:
      "photo" |
      "video";
    src:
      string;
    index:
      number;
  };
  alt:
    string;
  videoLabel:
    string;
  playLabel:
    string;
  onClick:
    () => void;
  className?:
    string;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      aria-label={
        media.type ===
        "video"
          ? playLabel
          : alt
      }
      className={`group relative overflow-hidden bg-sand-deep text-start ${className}`}
    >

      {media.type ===
      "video" ? (
        <>
          <video
            src={`${media.src}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            className="pointer-events-none h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />

          <div className="pointer-events-none absolute inset-0 bg-ink/25" />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper/95 text-green-800 shadow-xl backdrop-blur transition duration-300 group-hover:scale-110">

              <Play
                className="ms-1 h-6 w-6 fill-current"
              />

            </span>

          </div>

          <span className="pointer-events-none absolute bottom-4 start-4 rounded-full bg-ink/75 px-3 py-1.5 text-xs font-medium text-paper backdrop-blur">
            {videoLabel}
          </span>
        </>
      ) : (
        <img
          src={
            media.src
          }
          alt={
            alt
          }
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        />
      )}

    </button>
  );
}