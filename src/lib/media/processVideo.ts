type ProgressCallback =
  (
    progress: number,
    label: string
  ) => void;

type FFmpegInstance =
  import(
    "@ffmpeg/ffmpeg"
  ).FFmpeg;

const MAX_SOURCE_VIDEO_SIZE =
  300 *
  1024 *
  1024;

const MAX_OUTPUT_VIDEO_SIZE =
  300 *
  1024 *
  1024;

const WATERMARK_URL =
  "/filigrane.png";

const ALLOWED_VIDEO_TYPES =
  new Set([
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ]);

let ffmpegPromise:
  | Promise<FFmpegInstance>
  | null =
  null;

let activeProgress:
  | ProgressCallback
  | null =
  null;

function getExtension(
  file: File
) {
  if (
    file.type ===
    "video/webm"
  ) {
    return "webm";
  }

  if (
    file.type ===
    "video/quicktime"
  ) {
    return "mov";
  }

  return "mp4";
}

async function getFFmpeg() {
  if (
    ffmpegPromise
  ) {
    return ffmpegPromise;
  }

  ffmpegPromise =
    (
      async () => {
        const {
          FFmpeg,
        } =
          await import(
            "@ffmpeg/ffmpeg"
          );

        const ffmpeg =
          new FFmpeg();

        ffmpeg.on(
          "progress",
          ({
            progress,
          }) => {
            if (
              !activeProgress
            ) {
              return;
            }

            const value =
              Math.max(
                0,
                Math.min(
                  100,
                  Math.round(
                    progress *
                      100
                  )
                )
              );

            activeProgress(
              value,
              "Compression et ajout du filigrane..."
            );
          }
        );

        activeProgress?.(
          0,
          "Chargement du moteur vidéo..."
        );

        await ffmpeg.load({
          coreURL:
            "/ffmpeg/ffmpeg-core.js",

          wasmURL:
            "/ffmpeg/ffmpeg-core.wasm",
        });

        return ffmpeg;
      }
    )();

  return ffmpegPromise;
}

function copyUint8Array(
  input: Uint8Array
) {
  const output =
    new Uint8Array(
      input.byteLength
    );

  output.set(
    input
  );

  return output;
}

export async function processVideoForMathwa(
  file: File,
  onProgress?:
    ProgressCallback
): Promise<File> {
  if (
    !ALLOWED_VIDEO_TYPES.has(
      file.type
    )
  ) {
    throw new Error(
      "Utilise une vidéo MP4, WebM ou MOV."
    );
  }

  if (
    file.size >
    MAX_SOURCE_VIDEO_SIZE
  ) {
    throw new Error(
      "La vidéo originale ne doit pas dépasser 300 Mo."
    );
  }

  activeProgress =
    onProgress ??
    null;

  const id =
    crypto
      .randomUUID()
      .replaceAll(
        "-",
        ""
      );

  const extension =
    getExtension(
      file
    );

  const inputName =
    `input-${id}.${extension}`;

  const watermarkName =
    `watermark-${id}.png`;

  const outputName =
    `output-${id}.mp4`;

  const ffmpeg =
    await getFFmpeg();

  const {
    fetchFile,
  } =
    await import(
      "@ffmpeg/util"
    );

  try {
    onProgress?.(
      2,
      "Préparation de la vidéo..."
    );

    await ffmpeg.writeFile(
      inputName,
      await fetchFile(
        file
      )
    );

    await ffmpeg.writeFile(
      watermarkName,
      await fetchFile(
        WATERMARK_URL
      )
    );

    onProgress?.(
      5,
      "Compression et ajout du filigrane..."
    );

    /*
     * La vidéo :
     *
     * - reste dans son orientation
     * - n'est pas agrandie
     * - est limitée à 1920 px sur son grand côté
     * - watermark de 200 px au centre
     * - watermark opacité 50 %
     * - H.264
     * - qualité CRF 28
     * - audio AAC 128 kb/s
     */

    const filter =
      [
        "[0:v]" +
          "scale=" +
          "w=if(gt(iw\\,1920)\\,1920\\,iw):" +
          "h=if(gt(ih\\,1920)\\,1920\\,ih):" +
          "force_original_aspect_ratio=decrease:" +
          "force_divisible_by=2" +
          "[base]",

        "[1:v]" +
          "scale=200:-1," +
          "format=rgba," +
          "colorchannelmixer=aa=0.5" +
          "[wm]",

        "[base][wm]" +
          "overlay=" +
          "(main_w-overlay_w)/2:" +
          "(main_h-overlay_h)/2" +
          "[video]",
      ].join(
        ";"
      );

    const exitCode =
      await ffmpeg.exec([
        "-i",
        inputName,

        "-i",
        watermarkName,

        "-filter_complex",
        filter,

        "-map",
        "[video]",

        "-map",
        "0:a?",

        "-c:v",
        "libx264",

        "-preset",
        "veryfast",

        "-crf",
        "28",

        "-pix_fmt",
        "yuv420p",

        "-c:a",
        "aac",

        "-b:a",
        "128k",

        "-movflags",
        "+faststart",

        "-map_metadata",
        "-1",

        outputName,
      ]);

    if (
      exitCode !==
      0
    ) {
      throw new Error(
        "FFmpeg n'a pas réussi à traiter la vidéo."
      );
    }

    onProgress?.(
      96,
      "Création du fichier final..."
    );

    const output =
      await ffmpeg.readFile(
        outputName
      );

    if (
      typeof output ===
      "string"
    ) {
      throw new Error(
        "Résultat vidéo invalide."
      );
    }

    const bytes =
      copyUint8Array(
        output
      );

    const blob =
      new Blob(
        [
          bytes.buffer,
        ],
        {
          type:
            "video/mp4",
        }
      );

    if (
      blob.size >
      MAX_OUTPUT_VIDEO_SIZE
    ) {
      throw new Error(
        "La vidéo finale dépasse encore 300 Mo."
      );
    }

    onProgress?.(
      100,
      "Vidéo prête."
    );

    return new File(
      [
        blob,
      ],
      "video-mathwa.mp4",
      {
        type:
          "video/mp4",

        lastModified:
          Date.now(),
      }
    );
  } finally {
    activeProgress =
      null;

    await Promise.allSettled([
      ffmpeg.deleteFile(
        inputName
      ),

      ffmpeg.deleteFile(
        watermarkName
      ),

      ffmpeg.deleteFile(
        outputName
      ),
    ]);
  }
}