const MAX_IMAGE_EDGE =
  2200;

const WEBP_QUALITY =
  0.82;

const WATERMARK_OPACITY =
  0.5;

const WATERMARK_URL =
  "/filigrane.png";

const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

const MAX_SOURCE_IMAGE_SIZE =
  25 *
  1024 *
  1024;

let watermarkPromise:
  | Promise<HTMLImageElement>
  | null =
  null;

function loadImage(
  src: string
) {
  return new Promise<HTMLImageElement>(
    (
      resolve,
      reject
    ) => {
      const image =
        new Image();

      image.onload =
        () =>
          resolve(
            image
          );

      image.onerror =
        () =>
          reject(
            new Error(
              "Impossible de charger une image."
            )
          );

      image.src =
        src;
    }
  );
}

function getWatermark() {
  if (
    !watermarkPromise
  ) {
    watermarkPromise =
      loadImage(
        WATERMARK_URL
      );
  }

  return watermarkPromise;
}

function canvasToBlob(
  canvas:
    HTMLCanvasElement
) {
  return new Promise<Blob>(
    (
      resolve,
      reject
    ) => {
      canvas.toBlob(
        (
          blob
        ) => {
          if (
            !blob
          ) {
            reject(
              new Error(
                "Impossible de convertir l'image en WebP."
              )
            );

            return;
          }

          resolve(
            blob
          );
        },
        "image/webp",
        WEBP_QUALITY
      );
    }
  );
}

function fileNameWithoutExtension(
  fileName: string
) {
  const index =
    fileName.lastIndexOf(
      "."
    );

  if (
    index <=
    0
  ) {
    return fileName;
  }

  return fileName.slice(
    0,
    index
  );
}

export async function processImageForMathwa(
  file: File
): Promise<File> {
  if (
    !ALLOWED_IMAGE_TYPES.has(
      file.type
    )
  ) {
    throw new Error(
      `Format non accepté : ${file.name}`
    );
  }

  if (
    file.size >
    MAX_SOURCE_IMAGE_SIZE
  ) {
    throw new Error(
      `${file.name} dépasse 25 Mo.`
    );
  }

  const sourceUrl =
    URL.createObjectURL(
      file
    );

  try {
    const [
      sourceImage,
      watermark,
    ] =
      await Promise.all([
        loadImage(
          sourceUrl
        ),

        getWatermark(),
      ]);

    const originalWidth =
      sourceImage.naturalWidth;

    const originalHeight =
      sourceImage.naturalHeight;

    if (
      !originalWidth ||
      !originalHeight
    ) {
      throw new Error(
        `Dimensions impossibles à lire pour ${file.name}.`
      );
    }

    const largestEdge =
      Math.max(
        originalWidth,
        originalHeight
      );

    const scale =
      largestEdge >
      MAX_IMAGE_EDGE
        ? MAX_IMAGE_EDGE /
          largestEdge
        : 1;

    const outputWidth =
      Math.max(
        1,
        Math.round(
          originalWidth *
            scale
        )
      );

    const outputHeight =
      Math.max(
        1,
        Math.round(
          originalHeight *
            scale
        )
      );

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      outputWidth;

    canvas.height =
      outputHeight;

    const context =
      canvas.getContext(
        "2d",
        {
          alpha: false,
        }
      );

    if (
      !context
    ) {
      throw new Error(
        "Canvas non disponible dans ce navigateur."
      );
    }

    context.imageSmoothingEnabled =
      true;

    context.imageSmoothingQuality =
      "high";

    context.drawImage(
      sourceImage,
      0,
      0,
      outputWidth,
      outputHeight
    );

    /*
     * Taille du filigrane :
     * environ 16 % de la largeur,
     * avec une taille raisonnable
     * entre 90 px et 220 px.
     */

    const watermarkWidth =
      Math.round(
        Math.min(
          220,
          Math.max(
            90,
            outputWidth *
              0.16
          )
        )
      );

    const watermarkRatio =
      watermark.naturalHeight /
      watermark.naturalWidth;

    const watermarkHeight =
      Math.round(
        watermarkWidth *
          watermarkRatio
      );

    const watermarkX =
      Math.round(
        (
          outputWidth -
          watermarkWidth
        ) /
          2
      );

    const watermarkY =
      Math.round(
        (
          outputHeight -
          watermarkHeight
        ) /
          2
      );

    context.save();

    context.globalAlpha =
      WATERMARK_OPACITY;

    context.drawImage(
      watermark,
      watermarkX,
      watermarkY,
      watermarkWidth,
      watermarkHeight
    );

    context.restore();

    const outputBlob =
      await canvasToBlob(
        canvas
      );

    const baseName =
      fileNameWithoutExtension(
        file.name
      );

    return new File(
      [
        outputBlob,
      ],
      `${baseName}-mathwa.webp`,
      {
        type:
          "image/webp",

        lastModified:
          Date.now(),
      }
    );
  } finally {
    URL.revokeObjectURL(
      sourceUrl
    );
  }
}