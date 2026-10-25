import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  getR2PublicUrl,
} from "@/lib/r2";

import {
  sendTelegramAlbumFromFileIds,
  sendTelegramMessage,
  sendTelegramSingleFromFileId,
  uploadTelegramAlbum,
  uploadTelegramSingleMedia,
  type TelegramRemoteMedia,
  type TelegramReusableMedia,
} from "@/lib/telegram";

import {
  buildTelegramListingPost,
  type TelegramListing,
  type TelegramLocale,
} from "@/lib/telegramListingPost";

export const runtime =
  "nodejs";

const TELEGRAM_LOCALES: TelegramLocale[] =
  [
    "fr",
    "ar",
    "en",
    "ru",
  ];

type RequestBody = {
  listingId?: string;
};

type ListingImage = {
  storage_path: string;
  position: number;
  is_cover: boolean;
};

function toNumberOrNull(
  value: unknown
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : null;
}

function getMessageIds(
  value: unknown
): number[] {
  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        (
          item
        ) => {
          if (
            typeof item ===
              "object" &&
            item !== null &&
            "message_id" in
              item
          ) {
            const id =
              Number(
                (
                  item as {
                    message_id:
                      unknown;
                  }
                )
                  .message_id
              );

            return Number.isFinite(
              id
            )
              ? id
              : null;
          }

          return null;
        }
      )
      .filter(
        (
          id
        ): id is number =>
          id !== null
      );
  }

  if (
    typeof value ===
      "object" &&
    value !== null &&
    "message_id" in
      value
  ) {
    const id =
      Number(
        (
          value as {
            message_id:
              unknown;
          }
        )
          .message_id
      );

    if (
      Number.isFinite(
        id
      )
    ) {
      return [id];
    }
  }

  return [];
}

export async function POST(
  request: Request
) {
  const supabase =
    await createClient();

  /*
   * ==============================
   * VÉRIFICATION ADMIN
   * ==============================
   */

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error:
          "Non authentifié.",
      },
      {
        status: 401,
      }
    );
  }

  const {
    data: isAdmin,
    error:
      adminError,
  } =
    await supabase.rpc(
      "is_admin"
    );

  if (
    adminError ||
    !isAdmin
  ) {
    return NextResponse.json(
      {
        error:
          "Accès refusé.",
      },
      {
        status: 403,
      }
    );
  }

  /*
   * ==============================
   * BODY
   * ==============================
   */

  let body:
    RequestBody;

  try {
    body =
      (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      {
        error:
          "Requête invalide.",
      },
      {
        status: 400,
      }
    );
  }

  const listingId =
    body.listingId?.trim();

  if (!listingId) {
    return NextResponse.json(
      {
        error:
          "listingId est obligatoire.",
      },
      {
        status: 400,
      }
    );
  }

  /*
   * ==============================
   * RÉCUPÉRATION ANNONCE
   * ==============================
   */

  const {
    data:
      rawListing,
    error:
      listingError,
  } =
    await supabase
      .from(
        "listings"
      )
      .select(
        `
        id,
        reference,
        status,

        district,
        property_type,

        bedrooms,
        bathrooms,
        living_rooms,
        floor,
        area_m2,

        furnished,

        monthly_price,
        yearly_price,

        water_included,
        electricity_included,
        internet_included,

        air_conditioning,
        elevator,
        parking,
        kitchen,

        nabawi_distance_km,

        title_fr,
        title_ar,
        title_en,
        title_ru,

        video_path,

        listing_images (
          storage_path,
          position,
          is_cover
        )
      `
      )
      .eq(
        "id",
        listingId
      )
      .single();

  if (
    listingError ||
    !rawListing
  ) {
    return NextResponse.json(
      {
        error:
          "Annonce introuvable.",
      },
      {
        status: 404,
      }
    );
  }

  /*
   * On refuse de publier sur Telegram
   * une annonce qui n'est pas publiée
   * sur Mathwa.
   */

  if (
    rawListing.status !==
    "published"
  ) {
    return NextResponse.json(
      {
        error:
          "L'annonce doit être publiée avant l'envoi sur Telegram.",
      },
      {
        status: 400,
      }
    );
  }

  /*
   * ==============================
   * OBJET POUR LES TEXTES TELEGRAM
   * ==============================
   */

  const listing:
    TelegramListing = {
    id:
      rawListing.id,

    reference:
      rawListing.reference ??
      null,

    district:
      rawListing.district ??
      null,

    property_type:
      rawListing.property_type ??
      null,

    bedrooms:
      toNumberOrNull(
        rawListing.bedrooms
      ),

    bathrooms:
      toNumberOrNull(
        rawListing.bathrooms
      ),

    living_rooms:
      toNumberOrNull(
        rawListing.living_rooms
      ),

    floor:
      toNumberOrNull(
        rawListing.floor
      ),

    area_m2:
      toNumberOrNull(
        rawListing.area_m2
      ),

    furnished:
      rawListing.furnished ??
      null,

    monthly_price:
      toNumberOrNull(
        rawListing.monthly_price
      ),

    yearly_price:
      toNumberOrNull(
        rawListing.yearly_price
      ),

    water_included:
      rawListing.water_included ??
      null,

    electricity_included:
      rawListing.electricity_included ??
      null,

    internet_included:
      rawListing.internet_included ??
      null,

    air_conditioning:
      rawListing.air_conditioning ??
      null,

    elevator:
      rawListing.elevator ??
      null,

    parking:
      rawListing.parking ??
      null,

    kitchen:
      rawListing.kitchen ??
      null,

    nabawi_distance_km:
      toNumberOrNull(
        rawListing.nabawi_distance_km
      ),

    title_fr:
      rawListing.title_fr ??
      null,

    title_ar:
      rawListing.title_ar ??
      null,

    title_en:
      rawListing.title_en ??
      null,

    title_ru:
      rawListing.title_ru ??
      null,
  };

  /*
   * ==============================
   * PHOTOS
   * ==============================
   */

  const images =
    [
      ...(
        (
          rawListing.listing_images ??
          []
        ) as ListingImage[]
      ),
    ].sort(
      (
        a,
        b
      ) => {
        /*
         * La photo de couverture
         * passe en premier.
         */

        if (
          a.is_cover &&
          !b.is_cover
        ) {
          return -1;
        }

        if (
          !a.is_cover &&
          b.is_cover
        ) {
          return 1;
        }

        return (
          a.position -
          b.position
        );
      }
    );

  const photoUrls =
    images.map(
      (
        image
      ) => {
        const {
          data,
        } =
          supabase.storage
            .from(
              "listing-images"
            )
            .getPublicUrl(
              image.storage_path
            );

        return data.publicUrl;
      }
    );

  /*
   * ==============================
   * VIDÉO
   * ==============================
   */

  const videoUrl =
    rawListing.video_path
      ? getR2PublicUrl(
          rawListing.video_path
        )
      : null;

  /*
   * ==============================
   * MÉDIAS TELEGRAM
   * maximum 10
   * ==============================
   *
   * Avec vidéo :
   *
   * photo couverture
   * + vidéo
   * + maximum 8 autres photos
   *
   * = maximum 10 médias
   *
   * Sans vidéo :
   *
   * maximum 10 photos
   */

  const remoteMedia:
    TelegramRemoteMedia[] =
    [];

  if (
    videoUrl &&
    photoUrls.length >
      0
  ) {
    /*
     * Photo de couverture
     */

    remoteMedia.push({
      type:
        "photo",

      url:
        photoUrls[0],
    });

    /*
     * Vidéo
     */

    remoteMedia.push({
      type:
        "video",

      url:
        videoUrl,
    });

    /*
     * 8 photos supplémentaires
     */

    for (
      const photoUrl
      of photoUrls.slice(
        1,
        9
      )
    ) {
      remoteMedia.push({
        type:
          "photo",

        url:
          photoUrl,
      });
    }
  } else if (
    videoUrl
  ) {
    remoteMedia.push({
      type:
        "video",

      url:
        videoUrl,
    });
  } else {
    for (
      const photoUrl
      of photoUrls.slice(
        0,
        10
      )
    ) {
      remoteMedia.push({
        type:
          "photo",

        url:
          photoUrl,
      });
    }
  }

  /*
   * ==============================
   * ANTI-DOUBLON
   * ==============================
   */

  const {
    data:
      previousPosts,
    error:
      previousError,
  } =
    await supabase
      .from(
        "telegram_listing_posts"
      )
      .select(
        `
        locale,
        status
      `
      )
      .eq(
        "listing_id",
        listingId
      );

  if (
    previousError
  ) {
    return NextResponse.json(
      {
        error:
          previousError.message,
      },
      {
        status: 500,
      }
    );
  }

  const alreadyPublished =
    new Set(
      (
        previousPosts ??
        []
      )
        .filter(
          (
            post
          ) =>
            post.status ===
            "published"
        )
        .map(
          (
            post
          ) =>
            post.locale as TelegramLocale
        )
    );

  const localesToPublish =
    TELEGRAM_LOCALES.filter(
      (
        locale
      ) =>
        !alreadyPublished.has(
          locale
        )
    );

  /*
   * Tout est déjà publié.
   */

  if (
    localesToPublish.length ===
    0
  ) {
    return NextResponse.json(
      {
        ok: true,

        alreadyPublished:
          true,

        message:
          "Les 4 publications Telegram existent déjà.",
      }
    );
  }

  /*
   * ==============================
   * PUBLICATION
   * ==============================
   */

  let reusableMedia:
    TelegramReusableMedia[] |
    null =
    null;

  const results:
    {
      locale:
        TelegramLocale;
      success:
        boolean;
      error?:
        string;
    }[] =
    [];

  for (
    const locale
    of localesToPublish
  ) {
    /*
     * On crée / remet la ligne
     * en état pending avant l'envoi.
     */

    const {
      error:
        pendingError,
    } =
      await supabase
        .from(
          "telegram_listing_posts"
        )
        .upsert(
          {
            listing_id:
              listingId,

            locale,

            status:
              "pending",

            last_error:
              null,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "listing_id,locale",
          }
        );

    if (
      pendingError
    ) {
      results.push({
        locale,

        success:
          false,

        error:
          pendingError.message,
      });

      continue;
    }

    try {
      const caption =
        buildTelegramListingPost(
          listing,
          locale
        );

      let messageIds:
        number[] =
        [];

      /*
       * ============================
       * AUCUN MÉDIA
       * ============================
       */

      if (
        remoteMedia.length ===
        0
      ) {
        const message =
          await sendTelegramMessage(
            caption
          );

        messageIds =
          getMessageIds(
            message
          );
      }

      /*
       * ============================
       * PREMIÈRE LANGUE AVEC 1 MÉDIA
       * ============================
       */

      else if (
        !reusableMedia &&
        remoteMedia.length ===
          1
      ) {
        const reusable =
          await uploadTelegramSingleMedia(
            remoteMedia[0],
            caption
          );

        reusableMedia =
          [
            reusable,
          ];

        /*
         * uploadTelegramSingleMedia
         * retourne le file_id Telegram.
         * Le message a bien été publié,
         * mais son id n'est pas nécessaire
         * au fonctionnement de l'anti-doublon.
         */
      }

      /*
       * ============================
       * PREMIÈRE LANGUE AVEC ALBUM
       * ============================
       */

      else if (
        !reusableMedia &&
        remoteMedia.length >
          1
      ) {
        reusableMedia =
          await uploadTelegramAlbum(
            remoteMedia,
            caption
          );
      }

      /*
       * ============================
       * LANGUES SUIVANTES
       * 1 MÉDIA
       * ============================
       */

      else if (
        reusableMedia &&
        reusableMedia.length ===
          1
      ) {
        const message =
          await sendTelegramSingleFromFileId(
            reusableMedia[0],
            caption
          );

        messageIds =
          getMessageIds(
            message
          );
      }

      /*
       * ============================
       * LANGUES SUIVANTES
       * ALBUM
       * ============================
       */

      else if (
        reusableMedia &&
        reusableMedia.length >
          1
      ) {
        const messages =
          await sendTelegramAlbumFromFileIds(
            reusableMedia,
            caption
          );

        messageIds =
          getMessageIds(
            messages
          );
      }

      /*
       * ============================
       * SUCCÈS EN BASE
       * ============================
       */

      const now =
        new Date().toISOString();

      const {
        error:
          publishedError,
      } =
        await supabase
          .from(
            "telegram_listing_posts"
          )
          .update({
            status:
              "published",

            message_ids:
              messageIds.length >
              0
                ? messageIds
                : null,

            published_at:
              now,

            last_error:
              null,

            updated_at:
              now,
          })
          .eq(
            "listing_id",
            listingId
          )
          .eq(
            "locale",
            locale
          );

      if (
        publishedError
      ) {
        throw publishedError;
      }

      results.push({
        locale,

        success:
          true,
      });
    } catch (
      error
    ) {
      const errorMessage =
        error instanceof
        Error
          ? error.message
          : "Erreur Telegram inconnue.";

      console.error(
        `[Telegram ${locale}]`,
        error
      );

      await supabase
        .from(
          "telegram_listing_posts"
        )
        .update({
          status:
            "failed",

          last_error:
            errorMessage,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "listing_id",
          listingId
        )
        .eq(
          "locale",
          locale
        );

      results.push({
        locale,

        success:
          false,

        error:
          errorMessage,
      });
    }
  }

  /*
   * ==============================
   * RÉSULTAT
   * ==============================
   */

  const successCount =
    results.filter(
      (
        result
      ) =>
        result.success
    ).length;

  const failedCount =
    results.length -
    successCount;

  return NextResponse.json(
    {
      ok:
        failedCount ===
        0,

      listingId,

      mediaCount:
        remoteMedia.length,

      successCount,

      failedCount,

      results,
    },
    {
      status:
        failedCount ===
        0
          ? 200
          : 207,
    }
  );
}