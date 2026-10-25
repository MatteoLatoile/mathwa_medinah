import "server-only";

type TelegramApiResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

type TelegramPhotoSize = {
  file_id: string;
};

type TelegramVideo = {
  file_id: string;
};

type TelegramMessage = {
  message_id: number;

  photo?: TelegramPhotoSize[];

  video?: TelegramVideo;
};

export type TelegramRemoteMedia = {
  type: "photo" | "video";
  url: string;
};

export type TelegramReusableMedia = {
  type: "photo" | "video";
  fileId: string;
};

function getTelegramConfig() {
  const token =
    process.env
      .TELEGRAM_BOT_TOKEN
      ?.trim();

  const channelId =
    process.env
      .TELEGRAM_CHANNEL_ID
      ?.trim();

  if (!token) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN est manquant."
    );
  }

  if (!channelId) {
    throw new Error(
      "TELEGRAM_CHANNEL_ID est manquant."
    );
  }

  return {
    token,
    channelId,
  };
}

function getTelegramUrl(
  method: string
) {
  const {
    token,
  } =
    getTelegramConfig();

  return `https://api.telegram.org/bot${token}/${method}`;
}

async function parseTelegramResponse<T>(
  response: Response
): Promise<T> {
  const data =
    (
      await response.json()
    ) as TelegramApiResponse<T>;

  if (
    !response.ok ||
    !data.ok ||
    data.result ===
      undefined
  ) {
    throw new Error(
      data.description ||
        "Erreur Telegram."
    );
  }

  return data.result;
}

async function telegramJsonRequest<T>(
  method: string,
  payload:
    Record<
      string,
      unknown
    >
): Promise<T> {
  const response =
    await fetch(
      getTelegramUrl(
        method
      ),
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload
          ),

        cache:
          "no-store",
      }
    );

  return parseTelegramResponse<T>(
    response
  );
}

export function escapeTelegramHtml(
  value: string
) {
  return value
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    );
}

export async function sendTelegramMessage(
  text: string
) {
  const {
    channelId,
  } =
    getTelegramConfig();

  return telegramJsonRequest<TelegramMessage>(
    "sendMessage",
    {
      chat_id:
        channelId,

      text,

      parse_mode:
        "HTML",

      disable_web_page_preview:
        false,
    }
  );
}

async function downloadRemoteMedia(
  item:
    TelegramRemoteMedia,
  index: number
) {
  const response =
    await fetch(
      item.url,
      {
        cache:
          "no-store",
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Impossible de télécharger le média Telegram ${index + 1}.`
    );
  }

  const blob =
    await response.blob();

  /*
   * Limites Telegram Bot API :
   * photo uploadée : 10 Mo
   * vidéo uploadée : 50 Mo
   */

  const maxSize =
    item.type ===
    "photo"
      ? 10 *
        1024 *
        1024
      : 50 *
        1024 *
        1024;

  if (
    blob.size >
    maxSize
  ) {
    if (
      item.type ===
      "video"
    ) {
      throw new Error(
        "La vidéo Telegram dépasse 50 Mo après compression."
      );
    }

    throw new Error(
      "Une photo Telegram dépasse 10 Mo."
    );
  }

  const extension =
    item.type ===
    "video"
      ? "mp4"
      : "webp";

  return {
    blob,
    fileName:
      `mathwa-${index + 1}.${extension}`,
  };
}

function extractReusableMedia(
  messages:
    TelegramMessage[]
): TelegramReusableMedia[] {
  const media:
    TelegramReusableMedia[] =
    [];

  for (
    const message
    of messages
  ) {
    if (
      message.video
        ?.file_id
    ) {
      media.push({
        type:
          "video",

        fileId:
          message.video
            .file_id,
      });

      continue;
    }

    if (
      message.photo &&
      message.photo.length >
        0
    ) {
      const largest =
        message.photo[
          message.photo.length -
            1
        ];

      media.push({
        type:
          "photo",

        fileId:
          largest.file_id,
      });
    }
  }

  return media;
}

export async function uploadTelegramAlbum(
  media:
    TelegramRemoteMedia[],
  caption: string
): Promise<
  TelegramReusableMedia[]
> {
  const {
    channelId,
  } =
    getTelegramConfig();

  if (
    media.length <
    2 ||
    media.length >
    10
  ) {
    throw new Error(
      "Un album Telegram doit contenir entre 2 et 10 médias."
    );
  }

  const form =
    new FormData();

  form.set(
    "chat_id",
    channelId
  );

  const preparedMedia:
    Record<
      string,
      unknown
    >[] =
    [];

  for (
    let index =
      0;
    index <
    media.length;
    index++
  ) {
    const item =
      media[index];

    const downloaded =
      await downloadRemoteMedia(
        item,
        index
      );

    const attachmentName =
      `media${index}`;

    form.append(
      attachmentName,
      downloaded.blob,
      downloaded.fileName
    );

    preparedMedia.push({
      type:
        item.type,

      media:
        `attach://${attachmentName}`,

      ...(index ===
      0
        ? {
            caption,

            parse_mode:
              "HTML",
          }
        : {}),
    });
  }

  form.set(
    "media",
    JSON.stringify(
      preparedMedia
    )
  );

  const response =
    await fetch(
      getTelegramUrl(
        "sendMediaGroup"
      ),
      {
        method:
          "POST",

        body:
          form,

        cache:
          "no-store",
      }
    );

  const messages =
    await parseTelegramResponse<
      TelegramMessage[]
    >(
      response
    );

  const reusable =
    extractReusableMedia(
      messages
    );

  if (
    reusable.length !==
    media.length
  ) {
    throw new Error(
      "Telegram n'a pas retourné tous les identifiants des médias."
    );
  }

  return reusable;
}

export async function sendTelegramAlbumFromFileIds(
  media:
    TelegramReusableMedia[],
  caption: string
) {
  const {
    channelId,
  } =
    getTelegramConfig();

  if (
    media.length <
    2 ||
    media.length >
    10
  ) {
    throw new Error(
      "Un album Telegram doit contenir entre 2 et 10 médias."
    );
  }

  return telegramJsonRequest<
    TelegramMessage[]
  >(
    "sendMediaGroup",
    {
      chat_id:
        channelId,

      media:
        media.map(
          (
            item,
            index
          ) => ({
            type:
              item.type,

            media:
              item.fileId,

            ...(index ===
            0
              ? {
                  caption,

                  parse_mode:
                    "HTML",
                }
              : {}),
          })
        ),
    }
  );
}

export async function uploadTelegramSingleMedia(
  media:
    TelegramRemoteMedia,
  caption: string
): Promise<TelegramReusableMedia> {
  const {
    channelId,
  } =
    getTelegramConfig();

  const downloaded =
    await downloadRemoteMedia(
      media,
      0
    );

  const form =
    new FormData();

  form.set(
    "chat_id",
    channelId
  );

  form.set(
    "caption",
    caption
  );

  form.set(
    "parse_mode",
    "HTML"
  );

  if (
    media.type ===
    "video"
  ) {
    form.set(
      "supports_streaming",
      "true"
    );

    form.append(
      "video",
      downloaded.blob,
      downloaded.fileName
    );

    const response =
      await fetch(
        getTelegramUrl(
          "sendVideo"
        ),
        {
          method:
            "POST",

          body:
            form,

          cache:
            "no-store",
        }
      );

    const message =
      await parseTelegramResponse<TelegramMessage>(
        response
      );

    if (
      !message.video
        ?.file_id
    ) {
      throw new Error(
        "Telegram n'a pas retourné l'identifiant de la vidéo."
      );
    }

    return {
      type:
        "video",

      fileId:
        message.video
          .file_id,
    };
  }

  form.append(
    "photo",
    downloaded.blob,
    downloaded.fileName
  );

  const response =
    await fetch(
      getTelegramUrl(
        "sendPhoto"
      ),
      {
        method:
          "POST",

        body:
          form,

        cache:
          "no-store",
      }
    );

  const message =
    await parseTelegramResponse<TelegramMessage>(
      response
    );

  if (
    !message.photo ||
    message.photo.length ===
      0
  ) {
    throw new Error(
      "Telegram n'a pas retourné l'identifiant de la photo."
    );
  }

  return {
    type:
      "photo",

    fileId:
      message.photo[
        message.photo.length -
          1
      ].file_id,
  };
}

export async function sendTelegramSingleFromFileId(
  media:
    TelegramReusableMedia,
  caption: string
) {
  const {
    channelId,
  } =
    getTelegramConfig();

  if (
    media.type ===
    "video"
  ) {
    return telegramJsonRequest<TelegramMessage>(
      "sendVideo",
      {
        chat_id:
          channelId,

        video:
          media.fileId,

        caption,

        parse_mode:
          "HTML",

        supports_streaming:
          true,
      }
    );
  }

  return telegramJsonRequest<TelegramMessage>(
    "sendPhoto",
    {
      chat_id:
        channelId,

      photo:
        media.fileId,

      caption,

      parse_mode:
        "HTML",
    }
  );
}